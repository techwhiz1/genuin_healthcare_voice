const Router = require('express').Router;

const { tokenGenerator, voiceResponse } = require('./handler');
const { addMessage, viewHistory } = require('./db');

const router = new Router();
let user_phone = "";

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

//save user phone number
router.post('/v2/send_phone_number', (req, res) => {
  user_phone = req.body.number;
  res.send(true);
})

router.post('/v2/api/webhook', (req, res) => {
  try {
    const reqBody = JSON.stringify(req.body);
    const payload = req.body.message;
    if (payload.type == "end-of-call-report")
      addMessage(payload, user_phone).then(result => {
         res.send(result); 
      }).catch(err => {
         res.status(500).send(err);
      });
  } catch (error) {
    return error.message;
  }
})

router.post('/v2/view_history', (req, res) => {
  try {
    viewHistory(req.body.number).then(result => {
      res.send(result);
    }).catch(err => {
      res.status(500).send(err);
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
})

module.exports = router;
