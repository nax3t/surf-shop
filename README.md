# Theming Pt. 1 - Landing Page

## Important note, please read:
I'm using a new format for the follow along. It will resemble what you see when using a [git diff](https://git-scm.com/docs/git-diff) command.

For example,
```DIFF
const leaveMeAlone = require('leave-me-alone');
-const removeMe = require('remove-me');
+const addMe = require('add-me');
```
The above example means you should find the first line in your code, then remove the line with the minus - sign before it and add the line with the plus + sign before it.

If you have any questions about this new format, please ask them in the [course Discord server](https://discord.gg/QH4qbW7)

## Summary of added (A) and modified (M) files:

- (M) app.js
- (M) controllers/index.js
- (M) public/javascripts/allPostsClusterMap.js
- (M) public/stylesheets/style.css
- (M) seeds.js
- (M) views/index.ejs
- (M) views/layouts/boilerplate.ejs
- (M) views/partials/navbar.ejs

# Changes

## Install Moment JS
Run the following command in the terminal (from the project folder): `npm i -S moment`

## app.js

```DIFF
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
 
+// Add moment to every view
+app.locals.moment = require('moment');
+
// Configure Passport and Sessions
app.use(session({
  secret: 'hang ten dude!',
```

## controllers/index.js

```DIFF
 module.exports = {
   // GET /
   async landingPage(req, res, next) {
-    const posts = await Post.find({});
-    res.render('index', { posts, mapBoxToken, title: 'Surf Shop - Home' });
+    const posts = await Post.find({}).sort('-_id').exec();
+    const recentPosts = posts.slice(0, 3);
+    res.render('index', { posts, mapBoxToken, recentPosts, title: 'Surf Shop - Home' });
   },
   // GET /register
   getRegister(req, res, next) {
```

## public/javascripts/allPostsClusterMap.js

```DIFF
map.on('load', function() {
  map.on('mouseleave', 'clusters', mouseLeaveCursor);
  map.on('mouseenter', 'unclustered-point', mouseenterCursor);
  map.on('mouseleave', 'unclustered-point', mouseLeaveCursor);
});
+
+// Disable zoom from mouse scrollwheel
+map.scrollZoom.disable();
+// Add zoom and rotation controls to the map.
+map.addControl(new mapboxgl.NavigationControl());
+
```

## public/stylesheets/style.css

```DIFF
-body {
-  padding: 50px;
-  font: 14px "Lucida Grande", Helvetica, Arial, sans-serif;
-}
-
-a {
-  color: #00B7FF;
-}
+.logo {
+  color: #fff;
+}
+.logo:hover {
+  color: #fff;
+}
+
#map {
  width: 100%;
  height: 500px;
}
```

## seeds.js

```DIFF
price: random1000,
avgRating: random5,
-author: '5bb27cd1f986d278582aa58c'
+author: '5bb27cd1f986d278582aa58c', // replace with your user id
+images: [
+ {
+   url: 'https://res.cloudinary.com/devsprout/image/upload/v1561315599/surf-shop/surfboard.jpg'
+ }
+]
}
let post = new Post(postData);
```

## views/index.ejs

```DIFF
 <% layout('layouts/boilerplate') -%>
-<h1><%= title %></h1>
-<p>Welcome to <%= title %></p>
 <div id="map"></div>
+
+<div class="blog-home2 spacer">
+  <div class="container">
+    <!-- Row  -->
+    <div class="row justify-content-center">
+      <!-- Column -->
+       <div class="col-md-8 text-center">
+        <h2 class="title">Recent Posts</h2>
+        <h6 class="subtitle">Check out our latest listings</h6>
+       </div>
+      <!-- Column -->
+    </div>
+    <div class="row m-t-40">
+      <% recentPosts.forEach(post => { %>
+      <!-- Column -->
+      <div class="col-md-4">
+        <div class="card" data-aos="flip-left" data-aos-duration="1200">
+          <a href="/posts/<%= post.id %>"><img class="card-img-top" src="<%= post.images[0].url %>" alt="wrappixel kit"></a>
+          <div class="date-pos bg-info-gradiant"><%= moment(post._id).format('MMM') %><span><%= moment(post._id).format('D') %></span></div>
+          <h5 class="font-medium my-3"><a href="/posts/<%= post.id %>" class="link"><%= post.title %></a></h5>
+          <p class="my-1"><%= post.location %></p>    
+          <a href="/posts/<%= post.id %>" class="linking text-themecolor my-1">Learn More <i class="ti-arrow-right"></i></a>
+        </div>
+      </div>
+      <% }); %>
+    </div>
+  </div>
+</div>
+
<script>
  mapboxgl.accessToken = "<%= mapBoxToken %>";
  var posts = { features: <%- JSON.stringify(posts) %> };
</script>
<script src="/javascripts/allPostsClusterMap.js"></script>
```

## views/layouts/boilerplate.ejs
**Notes**: 
- You will need to get your own Font Awesome kit script from https://fontawesome.com/start
- This diff is a little trickier than the rest, so pay close attention and see the final file below to check your work

```DIFF
 <!DOCTYPE html>
 <html>
   <head>
+    <meta charset="utf-8">
+    <meta http-equiv="X-UA-Compatible" content="IE=edge">
+    <!-- Tell the browser to be responsive to screen width -->
+    <meta name="viewport" content="width=device-width, initial-scale=1">
     <title><%= title %></title>
     <!-- Include BS4 CDN for development -->
     <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
-    <link rel='stylesheet' href='/stylesheets/style.css' />
-    <link rel='stylesheet' href='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.css' type='text/css' />
-    <link href='https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css' rel='stylesheet' />
-    <script src='https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.js'></script>
-    <script src='https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.min.js'></script>
+    <!-- Theme Styles -->
+    <link rel="stylesheet" href="/wrapkit/css/style.css" />
+    <link rel="stylesheet" href="/wrapkit/css/index-landingpage/landing-page.css" />
+    <!-- Custom Styles -->
+    <link rel="stylesheet" href="/stylesheets/style.css" />
+    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.css" type="text/css" />
+    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css" rel="stylesheet" />
+    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.js"></script>
+    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.min.js"></script>
+    <!-- Get your own Font Awesome kit script from https://fontawesome.com/start this one won't work for you -->
+    <script src="https://kit.fontawesome.com/<replace-with-your-kit>.js"></script>
   </head>
   <body>
-   <% include ../partials/navbar %>
-   <% include ../partials/flash-messages %>
-   <%- body -%>
-    <% if (title === 'Posts Index') { %>
+    <!-- Main Wrapper  -->
+    <div id="main-wrapper">
+     <% include ../partials/navbar %>
+     <% include ../partials/flash-messages %>
+
+      <!-- Page Wrapper  -->
+      <div class="page-wrapper">
+        <!-- Container fluid  -->
+        <div class="container-fluid">
+          <!-- Static Slider 10  -->
+          <div class="static-slider-head" style="background-image:url(/images/banner-bg.jpg)">
+            <div class="container">
+              <!-- Row  -->
+              <div class="row justify-content-center">
+                <!-- Column -->
+                <div class="col-lg-8 col-md-6 align-self-center text-center" data-aos="fade-up" data-aos-duration="1200">
+                  <h1 class="title"><i class="fas fa-water"></i> Surf Shop</h1>
+                  <h4 class="subtitle font-light">Buy and Sell Surf Boards</h4> 
+                  <a href="/posts" class="btn btn-outline-light m-r-20 btn-md m-t-30 font-14">Shop</a><a href="/register" class="btn btn-md m-t-30 btn-danger-gradiant font-14">Sell</a>
+                </div>
+              </div>
+            </div>
+          </div>
+        </div>
+        <!-- /Container fluid  -->
+      </div>
+      <!-- /Page Wrapper  -->
+
+     <%- body -%>
+      
+      <!-- Footer  -->
+      <div class="footer4 b-t spacer">
+        <div class="container">
+          <div class="row">
+            <div class="col-lg-3 col-md-6 m-b-30">
+              <h5 class="m-b-20">Address</h5>
+              <p>100 Surf Shop Ln, CA 94051</p>
+            </div>
+            <div class="col-lg-3 col-md-6 m-b-30">
+              <h5 class="m-b-20">Phone</h5>
+              <p><a href="tel:+15555555555" class="link">+1 555 555 5555</a></p>
+            </div>
+            <div class="col-lg-3 col-md-6 m-b-30">
+              <h5 class="m-b-20">Email</h5>
+              <p><a href="mailto:info@surfshop.wav" class="link">info@surfshop.wav</a></p>
+            </div>
+            <div class="col-lg-3 col-md-6">
+              <h5 class="m-b-20">Social</h5>
+              <div class="round-social light">
+                <a href="#" class="link"><i class="fab fa-facebook"></i></a>
+                <a href="#" class="link"><i class="fab fa-twitter"></i></a>
+                <a href="#" class="link"><i class="fab fa-google-plus"></i></a>
+                <a href="#" class="link"><i class="fab fa-youtube"></i></a>
+                <a href="#" class="link"><i class="fab fa-instagram"></i></a>
+              </div>
+            </div>
+          </div>
+          <div class="f4-bottom-bar">
+            <div class="row">
+              <div class="col-md-12">
+                <div class="d-flex font-14">
+                  <div class="m-t-10 m-b-10 copyright">All Rights Reserved by Surf Shop.</div>
+                  <div class="links ml-auto m-t-10 m-b-10">
+                    <a href="#" class="p-10 p-l-0">Terms of Use</a>
+                    <a href="#" class="p-10">Legal Disclaimer</a>
+                    <a href="#" class="p-10">Privacy Policy</a>
+                  </div>
+                </div>
+              </div>
+            </div>
+          </div>
+        </div>
+      </div>
+      <!-- /Footer  -->
+    </div>
+    <!-- /Main Wrapper  -->
+
+    <!-- Add photo credit to footer: Photo by Tim Marshall on Unsplash -->
+
+    <!-- Scripts -->
+    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
+    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
+    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
+    <% if (title === "Posts Index") { %>
     <script src="/javascripts/post-index.js"></script>
     <% } %>
+    <script src="/wrapkit/js/custom.min.js"></script>
+    <script type="text/javascript">
+      $('a').on('click', function (event) {
+        var $anchor = $(this);
+        $('html, body').stop().animate({
+          scrollTop: $($anchor.attr('href')).offset().top - 90
+        }, 1000);
+        event.preventDefault();
+      });
+    </script>
   </body>
 </html>

```

### Once you've made the changes, the boilerplate.ejs file will look like this:

```HTML
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <!-- Tell the browser to be responsive to screen width -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><%= title %></title>
    <!-- Include BS4 CDN for development -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <!-- Theme Styles -->
    <link rel="stylesheet" href="/wrapkit/css/style.css" />
    <link rel="stylesheet" href="/wrapkit/css/index-landingpage/landing-page.css" />
    <!-- Custom Styles -->
    <link rel="stylesheet" href="/stylesheets/style.css" />
    <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.css" type="text/css" />
    <link href="https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css" rel="stylesheet" />
    <script src="https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.js"></script>
    <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v2.3.0/mapbox-gl-geocoder.min.js"></script>
    <!-- Get your own Font Awesome kit script from https://fontawesome.com/start this one won't work for you -->
    <script src="https://kit.fontawesome.com/<replace-with-your-kit>.js"></script>
  </head>
  <body>
    <!-- Main Wrapper  -->
    <div id="main-wrapper">
      <% include ../partials/navbar %>
      <% include ../partials/flash-messages %>

      <!-- Page Wrapper  -->
      <div class="page-wrapper">
        <!-- Container fluid  -->
        <div class="container-fluid">
          <!-- Static Slider 10  -->
          <div class="static-slider-head" style="background-image:url(/images/banner-bg.jpg)">
            <div class="container">
              <!-- Row  -->
              <div class="row justify-content-center">
                <!-- Column -->
                <div class="col-lg-8 col-md-6 align-self-center text-center" data-aos="fade-up" data-aos-duration="1200">
                  <h1 class="title"><i class="fas fa-water"></i> Surf Shop</h1>
                  <h4 class="subtitle font-light">Buy and Sell Surf Boards</h4> 
                  <a href="/posts" class="btn btn-outline-light m-r-20 btn-md m-t-30 font-14">Shop</a><a href="/register" class="btn btn-md m-t-30 btn-danger-gradiant font-14">Sell</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- /Container fluid  -->
      </div>
      <!-- /Page Wrapper  -->

      <%- body -%>
      
      <!-- Footer  -->
      <div class="footer4 b-t spacer">
        <div class="container">
          <div class="row">
            <div class="col-lg-3 col-md-6 m-b-30">
              <h5 class="m-b-20">Address</h5>
              <p>100 Surf Shop Ln, CA 94051</p>
            </div>
            <div class="col-lg-3 col-md-6 m-b-30">
              <h5 class="m-b-20">Phone</h5>
              <p><a href="tel:+15555555555" class="link">+1 555 555 5555</a></p>
            </div>
            <div class="col-lg-3 col-md-6 m-b-30">
              <h5 class="m-b-20">Email</h5>
              <p><a href="mailto:info@surfshop.wav" class="link">info@surfshop.wav</a></p>
            </div>
            <div class="col-lg-3 col-md-6">
              <h5 class="m-b-20">Social</h5>
              <div class="round-social light">
                <a href="#" class="link"><i class="fab fa-facebook"></i></a>
                <a href="#" class="link"><i class="fab fa-twitter"></i></a>
                <a href="#" class="link"><i class="fab fa-google-plus"></i></a>
                <a href="#" class="link"><i class="fab fa-youtube"></i></a>
                <a href="#" class="link"><i class="fab fa-instagram"></i></a>
              </div>
            </div>
          </div>
          <div class="f4-bottom-bar">
            <div class="row">
              <div class="col-md-12">
                <div class="d-flex font-14">
                  <div class="m-t-10 m-b-10 copyright">All Rights Reserved by Surf Shop.</div>
                  <div class="links ml-auto m-t-10 m-b-10">
                    <a href="#" class="p-10 p-l-0">Terms of Use</a>
                    <a href="#" class="p-10">Legal Disclaimer</a>
                    <a href="#" class="p-10">Privacy Policy</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /Footer  -->
    </div>
    <!-- /Main Wrapper  -->

    <!-- Add photo credit to footer: Photo by Tim Marshall on Unsplash -->

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
    <% if (title === "Posts Index") { %>
    <script src="/javascripts/post-index.js"></script>
    <% } %>
    <script src="/wrapkit/js/custom.min.js"></script>
    <script type="text/javascript">
      $('a').on('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
          scrollTop: $($anchor.attr('href')).offset().top - 90
        }, 1000);
        event.preventDefault();
      });
    </script>
  </body>
</html>

```

## views/partials/navbar.ejs

```DIFF
-<style>
- ul {
-   list-style-type: none;
-   margin: 0;
-   padding: 0;
- }
- li {
-   display: inline;
-   padding: 5px;
- }
-</style>
-
-<ul id="navbar">
- <li><a href="/">Home</a></li>
- <li><a href="/posts">Posts</a></li>
- <% if(!currentUser) { %>
- <li><a href="/register">Register</a></li>
- <li><a href="/login">Login</a></li>
- <% } else { %>
- <li><a href="/posts/new">New Post</a></li>
- <li><a href="/profile">Profile</a></li>
- <li><a href="/logout">Logout</a></li>
- Welcome, <%= currentUser.username %>!
- <% } %>
-</ul>
+<div class="topbar" id="top">
+ <div class="header6">
+   <div class="container po-relative">
+     <nav class="navbar navbar-expand-lg h6-nav-bar">
+       <!-- <a href="index.html" class="navbar-brand"><img src="/images/white-text.png" alt="wrapkit" /></a> -->
+       <a href="/" class="navbar-brand logo"><i class="fas fa-water"></i> Surf Shop</a>
+       <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#h6-info" aria-controls="h6-info" aria-expanded="false" aria-label="Toggle navigation"><span class="ti-menu"></span></button>
+       <div class="collapse navbar-collapse hover-dropdown font-14 ml-auto" id="h6-info">
+         <ul class="navbar-nav ml-auto">
+           <li class="nav-item"> 
+             <a class="nav-link" href="/">
+               Home
+             </a>
+           </li>
+           <li class="nav-item"> 
+             <a class="nav-link" href="/posts">
+               Posts
+             </a>
+           </li>
+           <% if(!currentUser) { %>
+           <li class="nav-item"> 
+             <a class="nav-link" href="/register">
+               Register
+             </a>
+           </li>
+           <li class="nav-item"> 
+             <a class="nav-link" href="/login">
+               Login
+             </a>
+           </li>
+           <% } else { %>
+           <li class="nav-item"> 
+             <a class="nav-link" href="/posts/new">
+               New Post
+             </a>
+           </li>
+           <li class="nav-item"> 
+             <a class="nav-link" href="/profile">
+               Profile
+             </a>
+           </li>
+           <li class="nav-item"> 
+             <a class="nav-link" href="/logout">
+               Logout
+             </a>
+           </li>
+           <% } %>
+         </ul>
+         <% if(currentUser) { %>
+         <div class="act-buttons">
+            <a href="#" class="btn btn-danger-gradiant font-14">Welcome, <%= currentUser.username %>!</a>
+         </div>
+         <% } %>
+       </div>
+     </nav>
+   </div>
+ </div>
+</div>
```
