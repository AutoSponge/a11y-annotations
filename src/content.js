const channel = new BroadcastChannel('a11y-annotations-bus');
channel.onmessage = (e) => chrome.runtime.sendMessage(e.data);
