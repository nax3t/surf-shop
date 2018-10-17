# Review Delete

- Create a delete button with a form in the post show view
- Update the delete route with isReviewAuthor middleware
and reviewDestroy method
- In reviewDestroy method: 
	- Find post by id and update to pull reviews with matching review_id
	- find review by id and remove
	- flash success
	- redirect to back to post show