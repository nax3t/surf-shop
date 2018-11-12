# Add Clear Rating Button to 5 Star Rating Feature

- Add a button to the new/edit review forms in /views/posts/show.ejs:
```HTML
<button class="clear-rating" type="button">Clear Rating</button>
```

- Add styling to /public/stylesheets/post-show.css
```CSS
.clear-rating {
  display: block;
}
```

- Add click listener to the clear rating button in /public/javascripts/post-show.js (selects and clicks nearest zero star rating input):
```JS
// Add click listener for clearing of rating from edit/create form
$('.clear-rating').click(function() {
	$(this).siblings('.input-no-rate').click();
});
```
