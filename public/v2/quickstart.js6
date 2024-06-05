$(function () {
  var speakerDevices = document.getElementById('speaker-devices');
  var ringtoneDevices = document.getElementById('ringtone-devices');
  var outputVolumeBar = document.getElementById('output-volume');
  var inputVolumeBar = document.getElementById('input-volume');
  var volumeIndicators = document.getElementById('volume-indicators');

  var device;

  // get call logs using vapi call api
  const get_logs = () => {
    setTimeout(() => {
      history_api()
    }, 5000)
  }

  log('Requesting Capability Token...');
  $.getJSON('token')
    .then(function (data) {
      log('Got a token.');
      console.log('Token: ' + data.token);

      // Setup Twilio.Device
      device = new Twilio.Device(data.token, {
        // Set Opus as our preferred codec. Opus generally performs better, requiring less bandwidth and
        // providing better audio quality in restrained network conditions. Opus will be default in 2.0.
        codecPreferences: ["opus", "pcmu"],
        // Use fake DTMF tones client-side. Real tones are still sent to the other end of the call,
        // but the client-side DTMF tones are fake. This prevents the local mic capturing the DTMF tone
        // a second time and sending the tone twice. This will be default in 2.0.
        fakeLocalDTMF: true,
        // Use `enableRingingState` to enable the device to emit the `ringing`
        // state. The TwiML backend also needs to have the attribute
        // `answerOnBridge` also set to true in the `Dial` verb. This option
        // changes the behavior of the SDK to consider a call `ringing` starting
        // from the connection to the TwiML backend to when the recipient of
        // the `Dial` verb answers.
        enableRingingState: true
      });

      device.on("ready", function (device) {
        log("Twilio.Device Ready!");
        document.getElementById("call-controls").style.display = "block";
      });

      device.on("error", function (error) {
        log("Twilio.Device Error: " + error.message);
      });

      device.on("connect", function (conn) {
        log("Successfully established call!");
        document.getElementById("button-call").style.display = "none";
        document.getElementById("button-hangup").style.display = "inline";
        volumeIndicators.style.display = "block";
        bindVolumeIndicators(conn);
      });

      device.on("disconnect", function (conn) {
        log("Call ended.");
        document.getElementById("button-call").style.display = "inline";
        document.getElementById("button-hangup").style.display = "none";
        volumeIndicators.style.display = "none";
        get_logs();
      });

      device.on("incoming", function (conn) {
        log("Incoming connection from " + conn.parameters.From);
        var archEnemyPhoneNumber = "+12093373517";

        if (conn.parameters.From === archEnemyPhoneNumber) {
          conn.reject();
          log("It's your nemesis. Rejected call.");
        } else {
          // accept the incoming connection and start two-way audio
          conn.accept();
        }
      });

      setClientNameUI(data.identity);

      device.audio.on("deviceChange", updateAllDevices.bind(device));

      // Show audio selection UI if it is supported by the browser.
      if (device.audio.isOutputSelectionSupported) {
        document.getElementById("output-selection").style.display = "block";
      }
    })
    .catch(function (err) {
      console.log(err);
      log("Could not get a token from server!");
    });

  // Bind button to make call
  document.getElementById("button-call").onclick = function () {
    // get the phone number to connect the call to
    if (document.getElementById("user-phone-number").value == "") {
      return alert("Please enter your phone number before call");
    }
    $.ajax({
      url: 'send_phone_number', // Replace with your URL
      method: 'POST',
      data: { number: document.getElementById("user-phone-number").value },
      success: function (data) {
        console.log("Phone number sent!");
      },
      error: function (error) {
        console.log('Error:', error);
      }
    });
    var params = {
      To: document.getElementById("phone-number").value
    };

    console.log("Calling " + params.To + "...");
    if (device) {
      var outgoingConnection = device.connect(params);
      outgoingConnection.on("ringing", function () {
        log("Ringing...");
      });
    }
  };

  // Bind button to hangup call
  document.getElementById("button-hangup").onclick = function () {
    log("Hanging up...");

    if (device) {
      device.disconnectAll();
    }
  };

  // Bind button to view history
  document.getElementById("button-history").onclick = function () {
    history_api();
  };

  document.getElementById("get-devices").onclick = function () {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(updateAllDevices.bind(device));
  };

  speakerDevices.addEventListener("change", function () {
    var selectedDevices = [].slice
      .call(speakerDevices.children)
      .filter(function (node) {
        return node.selected;
      })
      .map(function (node) {
        return node.getAttribute("data-id");
      });

    device.audio.speakerDevices.set(selectedDevices);
  });

  ringtoneDevices.addEventListener("change", function () {
    var selectedDevices = [].slice
      .call(ringtoneDevices.children)
      .filter(function (node) {
        return node.selected;
      })
      .map(function (node) {
        return node.getAttribute("data-id");
      });

    device.audio.ringtoneDevices.set(selectedDevices);
  });

  function bindVolumeIndicators(connection) {
    connection.on("volume", function (inputVolume, outputVolume) {
      var inputColor = "red";
      if (inputVolume < 0.5) {
        inputColor = "green";
      } else if (inputVolume < 0.75) {
        inputColor = "yellow";
      }

      inputVolumeBar.style.width = Math.floor(inputVolume * 300) + "px";
      inputVolumeBar.style.background = inputColor;

      var outputColor = "red";
      if (outputVolume < 0.5) {
        outputColor = "green";
      } else if (outputVolume < 0.75) {
        outputColor = "yellow";
      }

      outputVolumeBar.style.width = Math.floor(outputVolume * 300) + "px";
      outputVolumeBar.style.background = outputColor;
    });
  }

  function updateAllDevices() {
    updateDevices(speakerDevices, device.audio.speakerDevices.get());
    updateDevices(ringtoneDevices, device.audio.ringtoneDevices.get());
  }

  // Update the available ringtone and speaker devices
  function updateDevices(selectEl, selectedDevices) {
    selectEl.innerHTML = "";

    device.audio.availableOutputDevices.forEach(function (device, id) {
      var isActive = selectedDevices.size === 0 && id === "default";
      selectedDevices.forEach(function (device) {
        if (device.deviceId === id) {
          isActive = true;
        }
      });

      var option = document.createElement("option");
      option.label = device.label;
      option.setAttribute("data-id", id);
      if (isActive) {
        option.setAttribute("selected", "selected");
      }
      selectEl.appendChild(option);
    });
  }

  // Activity log
  function log(message) {
    var logDiv = document.getElementById("log");
    logDiv.innerHTML += "<p>&gt;&nbsp;" + message + "</p>";
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  // Activity log
  function call_log(message) {
    var logDiv = document.getElementById("call_log");
    var phone_number = message.from_me == true? "bot":message.chat_id;
    logDiv.innerHTML += "<p>&gt;&nbsp;" + phone_number + ": " + message.content + "</p>";
    logDiv.scrollTop = logDiv.scrollHeight;
  }

  // Set the client name in the UI
  function setClientNameUI(clientName) {
    var div = document.getElementById("client-name");
  }

  function history_api() {
    $.ajax({
      url: 'view_history',
      method: 'POST',
      data: { number: document.getElementById("user-phone-number").value },
      success: (data) => {
        document.getElementById("call_log").innerHTML = null;
        for (var i = data.length - 1; i > -1; i--)
          call_log(data[i]);
      },
      error: (err) => {
        console.log("Error: ", err);
      }
    })
  }
});
