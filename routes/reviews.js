const express = require('express');
const router = express.Router({ mergeParams: true });
const { asyncErrorHandler, isReviewAuthor } = require('../middleware');
const {
	reviewCreate,
	reviewUpdate,
	reviewDestroy
} = require('../controllers/reviews');

/* review reviews create /posts/:id/reviews */
router.post('/', asyncErrorHandler(reviewCreate));

/* PUT reviews update /posts/:id/reviews/:review_id */
router.put('/:review_id', isReviewAuthor, asyncErrorHandler(reviewUpdate));

/* DELETE reviews destroy /posts/:id/reviews/:review_id */
router.delete('/:review_id', (req, res, next) => {
  res.send('DELETE /posts/:id/reviews/:review_id');
});


module.exports = router;
