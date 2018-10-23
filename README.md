# Restrict One Review Per User, Per Post

- Populate reviews on post in reviewCreate method (in reviews controller)
- Filter post.reviews by author to see if logged in user has already reviewed the post
- Assign hasReviewed to filtered array's length
- If hasReviewed is true, then flash error and redirect
- Otherwise, create review, add to post.reviews, save post, flash success, and redirect