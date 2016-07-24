---
layout: post
title: "如何使用 Settings API 製作佈景後台選項？"
date: 2011-05-22 16:02
comments: true
tags: 
- WordPress
---
隨著 WordPress 版本號的推進，不只系統越變越肥大，外掛、佈景主題的條件也越來越嚴苛，全部規定必須使用官方的現有函數製作，雖然 WordPress 的函數庫真的很豐富很好用，不過這麼獨裁的規定著實讓人很不爽。

因此，由於官方要求，我必須使用 Settings API 來製作主題選項，但官方文件的資料的資訊實在太少了，在下沒慧根實在看不懂，經過 Google 百般尋覓後，將我較喜歡的幾篇文章（見參考出處）整合寫成了這篇文章，我沒有 PHP 底子，只有在圖書館翻過幾本書，內文可能會有些錯誤，請見諒。

<!-- more -->

##基礎架構

首先，建立一個空白的`php`檔案，以下以`function-admin.php`為例，實際情況依個人設定而有差異。然後，在`function.php`寫入下列程式碼，以引入`function-admin.php`這個外部檔案。

``` php
if ( file_exists( TEMPLATEPATH.'/function-admin.php' ) ) {
	require_once( TEMPLATEPATH.'/function-admin.php' );
	$theme_option = new theme_option();
}
```

接著在`function-admin.php`建立`class`，以下以`theme_option`為例：

``` php
<?php
class theme_option {
	// 建立選項區段
	private $sections;
 
	// 各個選項的預設值
	private $defaults = array(
		'test_checkbox' => '0', // 0 為停用，1 為啟用
		'test_text' => '',
		'test_select' => 'one',
		'test_radio' => 'one',
		'test_textarea' => ''
	);
 
	// checkbox的陣列，如果選項類型是 checkbox 的話，可能會出一些 "Undefined Index" 的問題，所以需要特別處理
	private $checkboxes;
 
	// 初始化
	public function __construct() {
		$this->checkboxes = array();
 
		$this->sections['general'] = 'General';
		$this->sections['reading'] = 'Reading';
		$this->sections['other'] = 'Other';
 
		// 將各個選項的預設值寫入資料庫
		$DBOptions = get_option('pixiv_options');
		$defaults = $this->defaults;
 
		if ( !is_array($DBOptions) ) $DBOptions = array();
 
		foreach ( $DBOptions as $key => $value ) {
			if ( isset($DBOptions[$key]) )
				$defaults[$key] = $DBOptions[$key];
		}
		update_option('pixiv_options', $defaults);
 
		add_action( 'admin_menu', array( &$this, 'add_pages' ) );
		add_action( 'admin_init', array( &$this, 'register_settings' ) );
	}
}
?>
```

初始化完成後，接著就可邁入下一個步驟「**註冊設定**」。

##註冊設定

為了要讓佈景選項出現在選單上，新增一個名為`add_pages`的函數：

``` php
public function add_pages() {
	$admin_page = add_theme_page( 'Theme Options', 'Theme Options', 'edit_theme_options', 'test-settings', array( &$this, 'display_page' ) );
}
```

Settings API 的設計雖然提供了一個更簡單的註冊設定的方式，但那僅限於選項很少的時候，若是 Pixiv Custom 這種選項數高達 51 項的主題就不可能一項一項編寫、呼叫個別的函數了，所以我們建立名為`create_setting`的函數，以精簡、整齊代碼。

``` php
public function create_setting( $args = array() ) {
	$defaults = array(
		'id'		=> '', // 選項 id
		'title'		=> '', // 選項標題
		'desc'		=> '', // 選項敘述
		'type'		=> 'text', // 選項類型
		'section'	=> 'general', // 選項區段（__construct函數中所設定的參數）
		'choices'	=> array(), // 選項分支（供radio, select用）
		'class'		=> '', // 選項 class
		'before'	=> '', // 選項前的文字
		'after'		=> '' // 選項後的文字
	);
 
	extract( wp_parse_args( $args, $defaults ) );
 
	$field_args = array(
		'type'		=> $type,
		'id'		=> $id,
		'desc'		=> $desc,
		'choices'	=> $choices,
		'label_for'	=> $id,
		'class'		=> $class,
		'before'	=> $before,
		'after'		=> $after
	);
 
	add_settings_field( $id, $title, array( $this, 'display_settings' ), 'test-settings', $section, $field_args );
 
	// 若選項類型為checkbox，將其加入checkboxes陣列
	if ( $type = 'checkbox' )
		$this->checkboxes[] = $id;
}
```

若陣列內容為空白，則會依照`defaults`來建立選項。可依個人使用的不同，加入或刪除變數。

接著就得分別填入每個選項的參數了，建立一個名為`register_settings`的函數。

``` php
public function register_settings() {
	register_setting( 'test_options', 'test_options', array( &$this, 'validate_settings' ) );
 
	// 新增選項區段
	foreach ( $this->sections as $slug => $title )
		add_settings_section( $slug, '', array( &$this, 'display_section' ), 'test-settings' );
 
	// checkbox 設定
	$this->create_setting( array (
		'id'		=> 'test_checkbox',
		'title'		=> 'Test Checkbox',
		'desc'		=> 'Test Checkbox',
		'type'		=> 'checkbox',
		'section'	=> 'general'
	) );
	// text 設定
	$this->create_setting( array (
		'id'		=> 'test_text',
		'title'		=> 'Test Text',
		'desc'		=> 'Test Text',
		'type'		=> 'text',
		'section'	=> 'general'
	) );
	// select 設定
	$this->create_setting( array (
		'id'		=> 'test_select',
		'title'		=> 'Test Select',
		'desc'		=> 'Test Select',
		'type'		=> 'select',
		'section'	=> 'general',
		'choices'	=> array(
			'one'	=> 'Option One',
			'two'	=> 'Option Two'
		)
	) );
	// radio 設定
	$this->create_setting( array (
		'id'		=> 'test_radio',
		'title'		=> 'Test Radio',
		'desc'		=> 'Test Raio',
		'type'		=> 'radio',
		'section'	=> 'general',
		'choices'	=> array(
			'one'	=> 'Option One',
			'two'	=> 'Option Two'
		)
	) );
	// textarea 設定
	$this->create_setting( array (
		'id'		=> 'test_textarea',
		'title'		=> 'Test Textarea',
		'desc'		=> 'Test Textarea',
		'type'		=> 'textarea',
		'section'	=> 'general'
	) );
}
```

到了這裡，只不過是設定了各個選項的數值罷了，選項頁面還是一片空白，喝點水休息一下，下一步就要正式設定選項頁面的內容了。

##顯示頁面

首先，新增一個名為`display_page`的函數。

``` php
public function display_page() { ?>
	<div class="wrap">
		<div class="icon32" id="icon-themes"></div>
		<h2>Theme Options</h2>
		<form action="options.php" method="post" id="test_admin" enctype="multipart/form-data">
			<?php
			if ( isset( $_GET['settings-updated'] ) )
				echo '<div class="updated fade"><p><strong>Settings saved.</strong></p>';
			?>
			<?php
			settings_fields('test_options');
			do_settings_sections( $_GET['page'] );
			?>
			<input type="submit" name="test_options[submit]" class="button-primary" value="<?php esc_attr_e('Save Changes', 'test'); ?>" />
			<input type="submit" name="test_options[reset]" class="button-secondary" onclick="if(confirm('Are you Sure?')) return true; else return false;" value="<?php esc_attr_e('Reset to Deafults', 'test'); ?>" />
		</form>
	</div>
<?php }
```

接著新增一個名為`display_section`的函數，該函數內容可以為空，也可以設定一些文字、HTML 內容等，輸出的內容會顯示在每個區段的最上方。

``` php
public function display_section() {
	// whatever
}
```

##顯示選項

到目前為止，主題選項頁面還是一片白，加入`display_settings`函數後，主題選項頁面就擁有最基礎的樣貌了。

``` php
public function display_settings( $args = array() ) {
	extract( $args );
 
	// 取得資料庫內的現有選項
	$options = get_option('test_options');
 
	// 以下顯示 register_settings 內所設定的選項參數
 
	// 如果設定了 class 參數，顯示 class 參數
	if ( $class != '' )
		echo '<div class="' . $class . '">';
 
	// 如果設定了選項敘述，顯示選項敘述
	if ( $desc != '' )
		echo $desc . '<br />';
 
	// 如果設定了 before 參數，在選項前顯示 before 參數
	if ( $before != '' )
		echo '<label for="' . $id . '">' . $before . '</label>';
 
	// 偵測選項類型，以下內容可依個人喜好自行設定
	switch ( $type ) {
		case 'checkbox':
			echo '<input type="checkbox" id="' . $id . '" name="test_options[' . $id . ']" value="1"'.checked( $options[$id], 1, false ) . ' />';
 
			break;
 
		case 'select':
			echo '<select name="test_options[' . $id . ']">';
 
			foreach ( $choices as $value => $label )
				echo '<option value="' . $value . '"' . selected( $options[$id], $value, false ) . '>' . $label . '</option>';
 
			echo '</select>';
 
			break;
 
		case 'radio':
			$i = 0;
			foreach ( $choices as $value => $label ) {
				echo '<input type="radio" name="test_options[' . $id . ']" id="' . $id . $i . '" value="' . $value . '"'. checked( $options[$id], $value, false ) . ' /><label for="' . $id . '">' . $label . '</label>';
				if( $i < count($options) - 1 )
					echo '<br />';
				$i++;
			}
 
			break;
 
		case 'textarea':
			echo '<textarea id="' . $id . '" name="test_options[' . $id . ']" cols="95%" rows="10">' . $options[$id] . '</textarea>';
 
			break;
 
		case 'text':
		default:
			echo '<input type="text" id="' . $id . '" name="test_options[' . $id . ']" value="' . $options[$id] . '" maxlength="' . $maxlength . '" />';
 
			break;
	}
 
	// 如果設定了 after 參數，在選項後顯示 after 參數
	if ( $after != '' )
		echo '<label for="' . $id . '">' . $after . '</label>';
 
	// 如果設定了 class 參數，以 div 包含選項
	if ( $class != '' )
		echo '</div>';
}
```

設定完成後，主題選項頁面就不再孤寥無幾了，但儲存似乎有些問題？沒錯，因為 Settings API 在`checkbox`的處理上有些問題，`checkbox`若停用就不會將數值寫入資料庫了，所以我們必須在選項儲存前先進行驗證，把停用的`checkbox`值補上`0`，此外，目前重設按鈕也沒有反應，也必須透過同樣的方式，事先偵測輸入值，若使用者按下重設按鈕，則拋棄現有設定，將開頭所設定的`defaults`變數寫入資料庫。

``` php
public function validate_settings( $input ) {
 
	$options = get_option('test_options');
	$valid_input = $options;
 
	$submit = ( ! empty( $input['submit'] ) ? true : false );
	$reset = ( ! empty( $input['reset'] ) ? true : false );
 
	if ( $submit ) {
		// 若 checkbox 停用，補 "0" 儲存至資料庫
		foreach ( $this->checkboxes as $id ) {
			if ( isset( $options[$id] ) && ! isset( $input[$id] ) )
				$input[$id] = '0';
		}
 
		$valid_input = $input;
 
	} elseif ( $reset ) {
		// 使用事先設定的預設值寫入資料庫
		$valid_input = $this->defaults;
	}
 
	return $valid_input;
}
```

##自定 JavaScript 與 CSS 樣式

如果只是基本的主題選項的話，第四步便可以宣告結束了，但如果想要進一步的設定 Javascript 與 CSS 樣式呢？你可以加入以下的函數，直接引入外部檔案，或是直接寫在 PHP 檔案也可以。   
*※ 附註：若直接使用 $ 當作 jQuery 標籤的話，可能會有衝突問題，請使用其他字串代替，或改為`jQuery(document).ready(function($){...});`*

``` php
public function styles() {
	wp_enqueue_style('testAdminCSS', get_template_directory_uri().'/admin/admin.css');
}
 
// 引入 Javascript
public function scripts() {
	wp_enqueue_script('testAdminJS', get_template_directory_uri().'/admin/admin.js');
}
```

然後在`add_pages`函數中，加入以下程式碼，就可成功引入 CSS 與 Javascript 了。

``` php
add_action( 'admin_print_scripts-' . $admin_page, array( &$this, 'scripts' ) );
add_action( 'admin_print_styles-' . $admin_page, array( &$this, 'styles' ) );
```

那麼該如何做出Pixiv Custom式樣的分頁呢？因為我PHP功力差，所以主要透過Javascript來包裝，你或許會有更好的方法也說不定。
首先，修改`display_page`函數，在你喜歡的地方加入以下程式碼：

``` html
<div id="test_switch">
<a id="tab0">分頁 1</a>
<a id="tab1">分頁 2</a>
<!-- 依此類推... -->
</div>
```

這樣選項頁面就會出現各個區段的連結文字了，接下來只要透過 Javascript 包裝表格，搭配 CSS 控制表格顯示即可。   
*※ ID必須符合`__construct`函數中的參數，前面再加上上述程式碼的前綴字元。*

``` js
jQuery(document).ready(function($){
	var cookie = $.cookie('pixiv_tabs') || 0;
	showTab(cookie);
 
	$("#pixiv_switch a").click(function(){
		var tab = $(this).prop('id').replace(/tab/,'');
		showTab(tab);
	});
});
function showTab(id){
	jQuery('#test_switch a').removeClass('current');
	jQuery('#test_switch a').eq(id).addClass('current');
	jQuery('form#test table').hide();
	jQuery('form#test table').eq(id).fadeIn();
	jQuery.cookie('test_tabs',id,{expires: 0.5});
}
 
/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */
jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') {
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString();
        }
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};
```

##套用

這個步驟相對而言就比較簡單了，首先在想要套用選項的位置加入以下程式碼，並設定

``` php
$option = get_options('test_options');
 
// checkbox 的情況
if ( $options['test_checkbox'] ) {
	...
} else {
	...
}
// 也可使用以下寫法
$options['test_checkbox'] ? ... : ...;
 
// text, textarea 的情況
if ( $options['test_text'] ) {
	echo $options['test_text'];
	...
}
 
// select, radio 的情況
if ( $options['test_select'] == 'one' ) {
	...
} elseif ( $options['test_select'] == 'two' ) {
	...
} else {
	...
}
```

##參考出處

[Extended WordPress Settings API Tutorial](http://alisothegeek.com/2011/01/wordpress-settings-api-tutorial-1/)   
[Incorporating the Settings API in WordPress Themes](http://www.chipbennett.net/2011/02/17/incorporating-the-settings-api-in-wordpress-themes)   
[WordPress Codex](http://codex.wordpress.org/Main_Page)   
[jQuery cookie plugin](https://github.com/carhartl/jquery-cookie)

##後記

這大概是我寫過最長的一篇文章，內容可能會有點枯燥乏味、充滿錯誤，<del>而且一張萌圖都沒有</del>，各位客倌就把這當成一篇筆記文章吧！