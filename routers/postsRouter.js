const express = require("express");
const postsController = require("../controllers/postsController");
const { idenifier } = require("../middlewares/identification");
const router = express.Router();

router.get("/all-posts", postsController.getposts);
router.get("/single-post", postsController.singlepost);
router.post("/create-post", idenifier, postsController.createPost);
router.put("/update-post", idenifier, postsController.updatePost);
router.delete("/delete-post", idenifier, postsController.deletePost);

module.exports = router;
