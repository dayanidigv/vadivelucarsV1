var url = 'https://innak-crew.github.io/innak-whatsapp-chat-widget-integration/innak-whatsapp-chat-widget-integration.js';
var s = document.createElement('script');
s.type = 'text/javascript';
s.async = true;
s.src = url;

var settings = {
    "enabled": true,
    'delay': 100,
    "iconButton": {
        "backgroundColor": "#00A884",
        "color": "#fff",
        "ctaText": "Chat with us",
        "borderRadius": "5",
        "marginLeft": "20",
        "marginRight": "20",
        "marginBottom": "20",
        "position": "left"
    },
    "brand": {
        "brandName": "Vadivelu Cars",
        "brandSubTitle": "",
        "brandImg": "",
        "welcomeText": "Welcome to Vadivelu Cars.\n Quality car care at great prices.",
        "messageText": "Hi, I came across your website and ...",
        "backgroundColor": "var(--primary-color)",
        "iconBackgroundColor": "#fff",
        "color": "#000",
        "borderColor" : '#000',
        "iconBorderColor" : '#fff',
        "ctaText": "Chat with us",
        "borderRadius": "25",
        "autoShow": false,
        "phoneNumber": "918012526677"
    }
};
s.onload = function () {
    initalzieWhatsappChatWidget(settings);
};
s.onerror = function(error) {
    console.error('Failed to load the script:', error);
};

document.head.appendChild(s);
