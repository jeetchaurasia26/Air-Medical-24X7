<?php
// ======================
// Zoho CRM Lead Handler
// ======================
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// 🔐 Your Zoho OAuth credentials
$client_id = "YOUR_CLIENT_ID";
$client_secret = "YOUR_CLIENT_SECRET";
$refresh_token = "YOUR_REFRESH_TOKEN";

// 1️⃣ Get access token
$token_url = "https://accounts.zoho.in/oauth/v2/token?refresh_token={$refresh_token}&client_id={$client_id}&client_secret={$client_secret}&grant_type=refresh_token";
$token_response = file_get_contents($token_url);
$token_data = json_decode($token_response, true);
$access_token = $token_data['access_token'] ?? '';

if (!$access_token) {
  echo json_encode(["error" => "Failed to get access token"]);
  exit;
}

// 2️⃣ Get form data (JSON)
$input = json_decode(file_get_contents("php://input"), true);
$name = $input['name'] ?? '';
$email = $input['email'] ?? '';
$phone = $input['number'] ?? '';
$location = $input['location'] ?? '';

// 3️⃣ Prepare Zoho payload
$leadData = [
  "data" => [[
    "Company" => "Air Medical 24x7 Website Lead",
    "Last_Name" => $name ?: "Unknown",
    "Email" => $email,
    "Phone" => $phone,
    "Description" => "Location: " . $location,
    "Lead_Source" => "Website Popup Form"
  ]]
];

// 4️⃣ Send to Zoho CRM
$ch = curl_init("https://www.zohoapis.in/crm/v2/Leads");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Authorization: Zoho-oauthtoken $access_token",
  "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($leadData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

// 5️⃣ Return Zoho response
echo $response;
