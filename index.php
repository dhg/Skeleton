<? $title = "Page Title";
include("includes/doc-head.php"); ?>

<div class="container">	
	<div class="sixteen columns header">
		<h1>Thellpo</h1>
		<p class="lead">This is the best page of all time</p>
		<hr />
	</div>
	<div class="eleven columns primary">
		<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam est dolor, eleifend vitae condimentum id, viverra vel mauris. Duis lacinia lacinia dictum. In viverra risus ut diam mattis adipiscing. Nam ut cursus odio. Phasellus mattis dolor nec risus mollis in commodo risus vestibulum. Cras bibendum facilisis mauris. Morbi ac turpis vel neque mollis tempor accumsan in quam. Phasellus pulvinar viverra diam. </p>
		<ul class="disc">
			<li>This is awesome</li>
			<li>This is awesome</li>
			<li>This is awesome</li>
			<li>This is awesome</li>
		</ul>
		<ul class="tabs">
			<li><a class="active" href="#info1">Info 1</a></li>
			<li><a href="#info2">Info 2</a></li>
		</ul>
		<ul class="tabs-content">
			<li class="active" id="info1"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam est dolor, eleifend vitae condimentum id, viverra vel mauris. Duis lacinia lacinia dictum. In viverra risus ut diam mattis adipiscing. Nam ut cursus odio. Phasellus mattis dolor nec risus mollis in commodo <a href="">risus vestibulum</a>. Cras bibendum facilisis mauris. Morbi ac turpis vel neque mollis tempor accumsan in quam. Phasellus pulvinar viverra diam. </p>
			<a href="" class="charcoal round nice button">Do It Hansel &raquo;</a></li>
			<li id="info2">
				<div class="eight columns alpha"><p>ALPHA</p></div>
				<div class="three columns omega"><p>OMEGA</p></div>
			</li>
		</ul>
	</div>
	<div class="five columns sidebar">
		<h3>Sidebar</h3>
		<p>This is some paragraph about something important although utimately it doesn't amatter</p>
		<ul class="square">
			<li>Hello</li>
			<li>Hello</li>
			<li>Hello</li>
			<li><a href="">Hello</a></li>
		</ul>
	</div>
</div><!-- container -->

<? include("includes/doc-foot.php");  ?>