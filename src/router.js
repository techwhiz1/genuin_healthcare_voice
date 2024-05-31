const Router = require('express').Router;

const { tokenGenerator, voiceResponse } = require('./handler');
const { addMessage } = require('./db');

const router = new Router();

/**
 * Generate a Capability Token for a Twilio Client user - it generates a random
 * username for the client requesting a token.
 */
router.get('/v2/token', (req, res) => {
  res.send(tokenGenerator());
});

router.post('/v2/voice', (req, res) => {
  res.set('Content-Type', 'text/xml');
  res.send(voiceResponse(req.body.To));
});

//save call logs
router.post('/v2/save_call_log', (req, res) => {
  res.send(addMessage(JSON.stringify(req.body)));
})

module.exports = router;
