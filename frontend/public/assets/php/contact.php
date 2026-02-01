<?php
// Set the response header to return JSON
header('Content-Type: application/json');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // Retrieve and sanitize form inputs
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    // Validate required fields
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode(['status' => 'error', 'message' => 'Please fill in all required fields.']);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
        exit;
    }

    // Telegram Bot Configuration
    $botToken = 'bot5658730618:AAGHo2wGfEJvZ5DZxw1MMpxKAw2_8PnXR_Q'; 
    $chatId = '1221832086'; // Replace with your chat ID

    // Construct the message
    $telegramMessage = "📩 New Contact Form Submission (Vadivelu Cars):\n\n" .
                       "👤 Name: $name\n" .
                       "📧 Email: $email\n" .
                       (!empty($subject) ? "📄 Subject: $subject\n" : "") .
                       "💬 Message:\n$message";

    // Send the message to Telegram
    $url = "https://api.telegram.org/{$botToken}/sendMessage";
    $postData = [
        'chat_id' => $chatId,
        'text' => $telegramMessage,
        'parse_mode' => 'HTML'
    ];

    $options = [
        'http' => [
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($postData)
        ]
    ];

    $context = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    // Check if the message was sent successfully
    if ($response) {
        echo json_encode(['status' => 'success', 'message' => 'Thank you! Your message has been sent.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'There was an issue sending your message. Please try again later.']);
    }
} else {
    // Reject non-POST requests
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
    exit;
}
