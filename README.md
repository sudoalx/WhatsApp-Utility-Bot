# WhatsApp Utility Bot

A WhatsApp bot that can perform various tasks such as downloading songs, movies, and images, as well as providing information on horoscopes, jokes, and quotes. The bot can also create stickers, convert media files, and provide news updates.

## Commands List

| Group Commands | Explanation | Example |
|---------|-------------|---------|
| /alive | Check if the bot is online or not | `/alive` |
| /admin | List of admin commands | `/admin` |
| /song | Download a song by name | `/song love me like you do` |
| /l | Get lyrics for a song | `/l Main woh chaand by darshan raval` |
| /delete | Delete a message sent by the bot | `/delete` |
| /joke | Get a random joke | `/joke` |
| /joke categories | Get a joke from a specific category | `/joke programming` |
| /meme | Get a random meme | `/meme` |
| /movie | Get a download link for a movie | `/movie Avengers` |
| /anime | Get a quote from an anime character or show | `/anime` |
| /anime name | Get a quote from an anime character with a specific name | `/anime name Saitama` |
| /anime title | Get a quote from an anime show with a specific title | `/anime title One Punch Man` |
| /sticker | Create a sticker from different media types | `/sticker pack myBitBot author MD` |
| /sticker crop | Crop the sticker size | `/sticker crop` |
| /sticker author | Add metadata to the sticker | `/sticker author MD` |
| /sticker pack | Add metadata to the sticker | `/sticker pack myBitBot` |
| /sticker nometadata | Remove all metadata from the sticker | `/sticker nometadata` |
| /steal | Send a sticker with the bot's metadata | `/steal` |
| /toimg | Convert a sticker to an image | `/toimg` |
| /image | Convert a sticker to an image | `/image` |
| /img | Search for an image using Google | `/img cute cat` |
| /mp3 | Convert a video to audio | `/mp3` |
| /mp4audio | Convert a video to audio | `/mp4audio` |
| /tomp3 | Convert a video to audio | `/tomp3` |
| /fact | Get a random fact | `/fact` |
| /news | Show tech news | `/news` |
| /news categories | Show news from a specific category | `/news sports` |
| /list | Show a list of categories for news | `/list` |
| /idp | Download the private profile picture of an Instagram user | `/idp username` |
| /insta | Download media from Instagram | `/insta linkadress` |
| /gender | Get the gender percentage of a name | `/gender FirstName` |
| /yt | Download a YouTube video in the best quality | `/yt youtubelink` |
| /vs | Search for and download a video | `/vs khena galat galat` |
| /horo | Show your horoscope based on your astrological sign | `/horo pisces` |
| /advice | Get a random advice from the bot | `/advice` |
| /quote | Get a random quote from the bot | `/quote` |
| /proq | Get a programming quote from the bot | `/proq` |
| /proquote | Get a programming quote from the bot | `/proquote` |
| /qpt | Get a poem written by an author | `/qpt author Shakespeare title sonnet` |
| /qpt author | Get a poem written by a specific author | `/qpt author Shakespeare` |
| /qpt authors | Get a list of authors for poems | `/qpt authors` |
| /qpoetry | Get a poem written by an author | `/qpoetry` |
| /removebg | Remove the background from an image | `/removebg` |
| /nsfw | Get the NSFW percentage of an image | `/nsfw` |
| /tts | Change text to a sticker | `/tts text` |
| /text | Add a header and footer to an image | `/text TopText;BottomText` |
| /ud | Show the meaning of a name | `/ud Mahesh` |
| /dic | Get the definition of a word from a dictionary | `/dic Love` |
| /txtmeme | Add a header and footer to an image | `/txtmeme TopText;BottomText` |
| /source | Get the source code | `/source` |  

| Admin Commands | Explanation | Example |
|---------|-------------|---------|
| /add | Add a new member to the group | `/add phone number` |
| /ban | Kick a member out of the group | `/ban @mention` |
| /promote | Give admin permissions to a member | `/promote @mention` |
| /demote | Remove admin permissions from a member | `/demote @mention` |
| /rename | Change the group's subject | `/rename new-subject` |
| /welcome | Set the group's welcome message | `/welcome` |
| /chat | Enable or disable group chat | `/chat on` or `/chat off` |
| /link | Get the group's link | `/link` |
| /warn | Give a warning to a member | `/warn @mention` |
| /unwarn | Remove a warning from a member | `/unwarn @mention` |
| /tagall | Send an attendance alert to all members | `/tagall message` |

Install the dependencies:

    pnpm install



    pnpm start

## Environment Variables

In order to run this project, you will need to add the following environment variables to your .env file:

```bash
# Mandatory Variables
PREFIX=/
MONGODB_KEY="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<appname>"
BOT_PHONE=0123456789
OWNER_PHONE=0123456789
CHANNEL=xxxxxxxxxxxxxx@g.us
```

## Optional Variables

`DEEPAI_KEY=` Get from [deepai.com](https://deepai.org/api-docs/)  
`INSTA_API_KEY=` Get from [Insta-fetcher](https://github.com/Gimenz/insta-fetcher#recommended-to-set-the-cookie-before-make-call-to-all-function)  
`OWNER_PHONE=` Enter your Number to get all owner commands.  
`BOT_PHONE=` Enter number on which bot is being deployed.  
`REMOVE_BG_KEY=` Get form [remove.bg](https://www.remove.bg/api)  
`TRUECALLER_ID=` Get from [truecaller.js](https://www.npmjs.com/package/truecallerjs#:~:text=Then%20login%20to%20your%20truecaller%20account%20)  
`GOOGLE_API_KEY=` Get form  [google developer console](https://console.cloud.google.com/)  
`SEARCH_ENGINE_KEY=` Get from [google developer console](https://programmablesearchengine.google.com/controlpanel/all)  
`MONGODB_KEY=` Get from [mongodb.com](https://www.mongodb.com/)  
`LYRICS_KEY=` Get form [Genius.com](https://docs.genius.com/#getting-started-h1)  
`PIN_KEY=` Get from [Pin](https://api.xteam.xyz/)  

## References

- [@Baileys](https://github.com/WhiskeySockets/Baileys)
