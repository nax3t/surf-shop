# Housekeeping - Bug Fixes and Updates Pt. 2

## Update number inputs (again, "D'oh!")

### File: /views/posts/new.ejs

Change:
```HTML
<div><input type="number" name="post[price]" placeholder="Price"></div>
```
to:
```HTML
<div><input type="number" name="post[price]" step=".01" placeholder="Price"></div>
```

### File: /views/posts/edit.ejs


Change:
```HTML
<div><input type="number" name="post[price]" placeholder="Price" value="<%= post.price  %>"></div>
```
to:
```HTML
<div><input type="number" name="post[price]" step=".01" placeholder="Price" value="<%= post.price  %>"></div>
```

## Update postUpdate method

### File: /controllers/posts.js

Change:
```JS
post.save();
```
to:
```JS
await post.save();
```

## Toggle Review Form

### File: /views/posts/show.ejs

Change:
```HTML
<h2>Create a Review</h2>
<form action="/posts/<%= post.id %>/reviews" method="POST">
	<textarea name="review[body]" required></textarea>
	<fieldset class="starability-basic">
	  <legend>Rating:</legend>
	  <button class="clear-rating" type="button">Clear Rating</button>
	  <input type="radio" id="rate0" class="input-no-rate" name="review[rating]" value="0" checked aria-label="No rating." />
	  <input type="radio" id="rate1" name="review[rating]" value="1" />
	  <label for="rate1" title="Terrible">1 star</label>
	  <input type="radio" id="rate2" name="review[rating]" value="2" />
	  <label for="rate2" title="Not good">2 stars</label>
	  <input type="radio" id="rate3" name="review[rating]" value="3" />
	  <label for="rate3" title="Average">3 stars</label>
	  <input type="radio" id="rate4" name="review[rating]" value="4" />
	  <label for="rate4" title="Very good">4 stars</label>
	  <input type="radio" id="rate5" name="review[rating]" value="5" />
	  <label for="rate5" title="Amazing">5 stars</label>
	</fieldset>

	<input type="submit">
</form>
```
to:
```HTML
<% if(currentUser) { %>
<h2>Create a Review</h2>
<form action="/posts/<%= post.id %>/reviews" method="POST">
	<textarea name="review[body]" required></textarea>
	<fieldset class="starability-basic">
	  <legend>Rating:</legend>
	  <button class="clear-rating" type="button">Clear Rating</button>
	  <input type="radio" id="rate0" class="input-no-rate" name="review[rating]" value="0" checked aria-label="No rating." />
	  <input type="radio" id="rate1" name="review[rating]" value="1" />
	  <label for="rate1" title="Terrible">1 star</label>
	  <input type="radio" id="rate2" name="review[rating]" value="2" />
	  <label for="rate2" title="Not good">2 stars</label>
	  <input type="radio" id="rate3" name="review[rating]" value="3" />
	  <label for="rate3" title="Average">3 stars</label>
	  <input type="radio" id="rate4" name="review[rating]" value="4" />
	  <label for="rate4" title="Very good">4 stars</label>
	  <input type="radio" id="rate5" name="review[rating]" value="5" />
	  <label for="rate5" title="Amazing">5 stars</label>
	</fieldset>

	<input type="submit">
</form>
<% } else { %>
<h2><a href="/login?returnTo=true">Create a Review</a></h2>
<% } %>
```

Change:
```HTML
<% if(review.author.equals(currentUser._id)) { %>
```
to:
```HTML
<% if(currentUser && review.author.equals(currentUser._id)) { %>
```

### File: /controllers/index.js

Change:
```JS
getLogin(req, res, next) {
	if (req.isAuthenticated()) return res.redirect('/');
	res.render('login', { title: 'Login' });
},
```
to:
```JS
getLogin(req, res, next) {
	if (req.isAuthenticated()) return res.redirect('/');
	if (req.query.returnTo) req.session.redirectTo = req.headers.referer;
	res.render('login', { title: 'Login' });
},
```