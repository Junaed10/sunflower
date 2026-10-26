# Sunflower Dream — VS Code package

## চালানোর নিয়ম

1. ZIP extract করে folder-টি VS Code-এ **Open Folder** করুন।
2. Live Server extension চালান, অথবা terminal-এ `python3 -m http.server 8000` দিয়ে `http://localhost:8000` খুলুন.
3. আলাদা package install/build লাগবে না.

## Entry popup

Homepage-க்கு முன்பு “Do you agree Rafin is a Tiger?” popup আসে. আপনার দেওয়া portrait ও চারটি animated tiger cutout `assets/tiger-gate/`-এ locally bundled. Agree চাপলে homepage খুলবে; Disagree-এর ওপর hover করলে সেটি লুকিয়ে যাবে.

## Assets, sun and audio

Meadow, sunflowers, clouds, tiger cutouts, portrait এবং fonts local `assets/` folder-এ আছে. Phone-width mobile view-তে sun পুরোপুরি দৃশ্যমান, এবং meadow load হলে sunlight একবার উজ্জ্বল হয়ে ম্লান হয়. Audio player-এর default ImageKit MP3 অনলাইনে stream হয়; MP3 ZIP-এ নেই, তাই গান শুনতে internet connection ও active link দরকার.
