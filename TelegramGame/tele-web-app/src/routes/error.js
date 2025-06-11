const express = require("express");
const router =  new express.Router();

router.get("*", (req, res) => {
    return res.status(404).render("errors/404");
});

module.exports = router;
