<!doctype html>
<!--[if lt IE 7 ]><html class="ie ie6" lang="en"> <![endif]-->
<!--[if IE 7 ]><html class="ie ie7" lang="en"> <![endif]-->
<!--[if IE 8 ]><html class="ie ie8" lang="en"> <![endif]-->
<!--[if (gte IE 9)|!(IE)]><!--> 	<html lang="en"> <!--<![endif]-->
<head>

	<!-- Basic Page Needs
  ================================================== -->
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">	<!-- Force Latest IE rendering engine -->
	<title><?= $page_title ?></title>
	<meta name="description" content="">
	<meta name="author" content="">
	
	<!-- Mobile Specific Metas
  ================================================== -->
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />  
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /> 
	
	<!-- CSS
  ================================================== -->
	<link rel="stylesheet" href="src/stylesheets/base.css">
	<link rel="stylesheet" href="src/stylesheets/skeleton.css">
	<link rel="stylesheet" href="src/stylesheets/ui.css">
	<link rel="stylesheet" href="src/stylesheets/layout.css">
	<link rel="stylesheet" href="documentation-assets/docs.css">
	<!--[if lt IE9]><link rel="stylesheet" href="css/ie.css"><![endif]-->
	
	<!-- JS (see footer for rest)
  ================================================== -->
	<script src="src/javascripts/modernizr-1.7.min.js"></script>
	
	<!-- Favicons
	================================================== -->
	<link rel="shortcut icon" href="/favicon.ico">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">

</head>
<body>



			
			<div class="container fluid">	
				<div class="four columns sidebar">
					<nav>
						<img src="documentation-assets/images/logo.png" id="logo"></img>
						<ul>
							<li><a class="active" href="#whatAndWhy">What & Why</a></li>
							<li><a href="#basics">Basics</a></li>
							<li><a href="#typography">Typography</a></li>
							<li><a href="#grid">Grid</a></li>
							<li><a href="#buttons">Buttons</a></li>
							<li><a href="#tabs">Tabs</a></li>
							<li><a href="#forms">Forms</a></li>
							<li><a href="#mediaQueries">Media Queries</a></li>
							<li><a href="#theFuture">The Future</a></li>
						</ul>
					</nav>
					&nbsp;
				</div>
				<div class="twelve columns content">
					<header>
						<p>Skeleton is a lightweight framework for HTML, CSS & jQuery that makes building websites easier.</p>
					</header>
					<hr class="large" />
					<div class="doc-section" id="whyAndWhat">
						<h3>What &amp; Why</h3>
						<p>Here is where I need to chat about what Skeleton is, why it's awesome and how what the file structure is. Focus on: 1) Speed, 2) Best Practices , 3) Across devices</p>
					</div>
					<hr />
					<div class="doc-section" id="basics">
						<h3>Basics</h3>
						<p>Here is where I need to chat about what Skeleton is, why it's awesome and how what the file structure is. Focus on: 1) Speed, 2) Best Practices , 3) Across devices</p>
					</div>
					<hr />
					<div class="doc-section" id="typography">
						<h3>Typography</h3>
						<p>The typography of Skeleton is designed to create a strong hierarchy with basic styles. The primary font is the classic Helvetica Neue, but the font stack can be easily changes with just a couple adjustments.</p>
						<h1>Heading &lt;h1&gt;</h1>
						<h2>Heading &lt;h2&gt;</h2>
						<h3>Heading &lt;h3&gt;</h3>
						<h4>Heading &lt;h4&gt;</h4>
						<h5>Heading &lt;h5&gt;</h5>
						<h6>Heading &lt;h6&gt;</h6>
					</div>
					<hr />
					<div class="doc-section clearfix" id="grid">
						<h3>Grid</h3>
						<p>Skeleton's base grid is a simpler variation of the 960 grid system. The syntax is simpler and is just as effective cross browser and across devices, but the awesome part is that it also has the flexibility to go mobile like a champ. The option is yours to have the site scale fluidly or to have a scaled fixed grid.</p>
						<div class="example-grid">
							<div class="one column alpha">One</div>
							<div class="eleven columns omega">Eleven</div>
							<div class="two columns alpha">Two</div>
							<div class="ten columns omega">Ten</div>
							<div class="three columns alpha">Three</div>
							<div class="nine columns omega">Nine</div>
							<div class="four columns alpha">Four</div>
							<div class="eight columns omega">Eight</div>
							<div class="five columns alpha">Five</div>
							<div class="seven columns omega">Seven</div>
							<div class="six columns alpha">Six</div>
							<div class="six columns omega">Six</div>
							<div class="seven columns alpha">Seven</div>
							<div class="five columns omega">Five</div>
							<div class="eight columns alpha">Eight</div>
							<div class="four columns omega">Four</div>
							<div class="nine columns alpha">Nine</div>
							<div class="three columns omega">Three</div>
							<div class="ten columns alpha">Ten</div>
							<div class="two columns omega">Two</div>
							<div class="eleven columns alpha">Eleven</div>
							<div class="one column omega">One</div>
						</div>
					</div>
					<hr />
					<div class="doc-section" id="tabs">
						<h3>Tabs</h3>
						<p>Here is where I need to chat about what Skeleton is, why it's awesome and how what the file structure is. Focus on: 1) Speed, 2) Best Practices , 3) Across devices</p>
						<ul class="tabs">
							<li><a class="active" href="#simple">Simple</a></li>
							<li><a href="#lightweight">Lightweight</a></li>
							<li><a href="#mobileFriendly">Mobile</a></li>
						</ul>
						<ul class="tabs-content">
							<li class="active" id="simpleTab">This is content about how these tabs are simple</li>
							<li id="lightweightTab">This is content about how these tabs are lightweight</li>
							<li id="mobileFriendlyTab">This is content about how these tabs are mobile friendly</li>
						</ul>
					</div>
					<hr />
					<div class="doc-section" id="forms">
						<h3>Forms</h3>
						<p>Here is where I need to chat about what Skeleton is, why it's awesome and how what the file structure is. Focus on: 1) Speed, 2) Best Practices , 3) Across devices</p>
					</div>
					<hr />
					<div class="doc-section" id="mediaQueries">
						<h3>Media Queries</h3>
						<p>Here is where I need to chat about what Skeleton is, why it's awesome and how what the file structure is. Focus on: 1) Speed, 2) Best Practices , 3) Across devices</p>
					</div>
					<hr />
					<div class="doc-section" id="theFuture">
						<h3>The Future</h3>
						<p>Here is where I need to chat about what Skeleton is, why it's awesome and how what the file structure is. Focus on: 1) Speed, 2) Best Practices , 3) Across devices</p>
					</div>
				</div>
			</div><!-- container -->





		
		<!-- JS
		================================================== -->
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js"></script>
		<script>window.jQuery || document.write("<script src='src/javascripts/jquery-1.5.1.min.js'>\x3C/script>")</script>
		<script src="src/javascripts/modernizr-1.7.min.js"></script>
		<script src="src/javascripts/app.js"></script>
	</body>
</html>