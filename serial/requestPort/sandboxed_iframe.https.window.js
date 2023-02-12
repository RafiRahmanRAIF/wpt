// META: script=/resources/test-only-api.js
// META: script=/serial/resources/common.js
// META: script=/serial/resources/automation.js

let iframe = document.createElement('iframe');

serial_test(async (t, fake) => {
  // Wait until the iframe is loaded.
  await new Promise(resolve => {
    iframe.src = '../resources/open-in-iframe.html';
    iframe.sandbox.add('allow-scripts');
    iframe.allow = 'serial';
    document.body.appendChild(iframe);
    iframe.addEventListener('load', resolve);
  });

  // Wait until the iframe's mojo interface binds to fakeSerialService.
  iframe.contentWindow.postMessage(
      {type: 'SetupBinding', interfaceName: fakeSerialService.interfaceName()},
      '*');
  await new Promise((resolve) => {window.addEventListener('message', e => {
                      if (e.data.type == 'Attach') {
                        fakeSerialService.bind(e.data.handle);
                      } else if (e.data.type = 'Ready') {
                        resolve();
                      }
                    })});

  let token = fake.addPort();
  fake.setSelectedPort(token);
  await new Promise(resolve => {
    iframe.contentWindow.postMessage({type: 'RequestPort'}, '*');
    window.addEventListener('message', (messageEvent) => {
      assert_equals(messageEvent.data, 'Success');
      resolve();
    });
  });
}, 'Calls to Serial APIs from a sandboxed iframe are valid.');
