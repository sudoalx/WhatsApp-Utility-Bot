const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');

const validate = (url) => {
    // Regular expression to match Facebook domain in URL
    const regex = /^.*https:\/\/(?:www|m|web)\.facebook\.com\/.*/;

    // Check if the URL matches the regex pattern
    return regex.test(url);
};

const reactToMessage = async (from, sock, msg, emoji) => {
    const reactonMessage = {
        react: {
            text: emoji,
            key: msg.key
        }
    }
    return sock.sendMessage(from, reactonMessage);
}

const extractUrl = (text) => {
    // extract the first URL from the text
    const url = text.match(/(https?:\/\/[^\s]+)/g);
    return url ? url[0] : null;
}

const handler = async (sock, msg, from, args, msgInfoObj) => {

    return sock.sendMessage(from, { text: "🚧 This command is under development." }, { quoted: msg });

    // react to the message with a loading indicator
    await reactToMessage(from, sock, msg, "🔄");

    let facebook_url = args[0];
    if (!facebook_url) {
        const quotedMsg = msgInfoObj.content;
        const parsedMsg = JSON.parse(quotedMsg);

        // Extract the quotedMessage object from the nested structure
        const quotedMessage = parsedMsg.extendedTextMessage.contextInfo.quotedMessage;

        // if quotedMessage.conversation exists, extract url from it
        if (quotedMessage && quotedMessage.conversation) {
            facebook_url = extractUrl(quotedMessage.conversation);
        } else if (quotedMessage && quotedMessage.extendedTextMessage) {
            // Extract the text property from the quotedMessage object
            const quotedText = quotedMessage.extendedTextMessage.text;
            facebook_url = extractUrl(quotedText);
        }

        console.log("Facebook URL: ", facebook_url)
    }
    if (!validate(facebook_url)) {
        await reactToMessage(from, sock, msg, "❌");
        return sock.sendMessage(from, { text: "❌ Invalid Facebook URL" }, { quoted: msg });
    }

    // Download the video from the URL using fetch and chrome windows user agent
    async function getFinalUrl(url) {
        try {
            const response = await axios.head(url, {
                maxRedirects: 0, // To prevent Axios from automatically following redirects
                validateStatus: status => status >= 200 && status < 400 // Only allow successful status codes
            });
            if (response.headers && response.headers.location) {
                return response.headers.location; // Return the final URL after redirects
            } else {
                return url; // If there are no redirects, return the original URL
            }
        } catch (error) {
            console.error('Error occurred:', error.message);
            return null;
        }
    }

    try {
        // Get the final URL
        let final_url = await getFinalUrl(facebook_url);
        if (!final_url) {
            console.error('Failed to retrieve final URL.');
            await reactToMessage(from, sock, msg, "❌");
            return sock.sendMessage(from, { text: "❌ Failed to retrieve final URL." }, { quoted: msg });
        }

        console.log('Final URL:', final_url);

        // Check if the final URL contains the word "reel"
        if (final_url.includes('reel')) {
            // Replace "www" with "m" to load the mobile version
            final_url = final_url.replace('www', 'm');
            console.log('Mobile URL:', final_url);
        }

        // Load the mobile version using an Android user agent
        const response = await axios.get(final_url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Mobile Safari/537.36'
            }
        });

        // Parse the HTML response using Cheerio
        const $ = cheerio.load(response.data);

        // Look for the meta tag containing the video URL
        const videoUrl = $('meta[property="og:video"]').attr('content');

        if (videoUrl) {
            console.log('Video URL:', videoUrl);
            // Now you can proceed to download the video using the extracted URL
        } else {
            console.log('Video URL not found in the response.');
        }

        // Look for the pattern in the response to extract the video URL
        const videoPattern = /<meta property="og:video" content="([^"]+)"/g;
        console.log('Response:', response);


        const match = response.data.match(videoPattern);
        if (match && match[1]) {
            const videoUrl = match[1];
            console.log('Video URL:', videoUrl);

            // Download the video
            const videoResponse = await axios({
                url: videoUrl,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream('downloaded_video.mp4');
            videoResponse.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log('Video downloaded successfully.');
                    sock.sendMessage(from, { video: { url: 'downloaded_video.mp4' } }, { quoted: msg });
                    resolve();
                });
                writer.on('error', (error) => {
                    console.error('Error occurred while downloading the video:', error.message);
                    sock.sendMessage(from, { text: "❌ Error occurred while downloading the video." }, { quoted: msg });
                    reject(error);
                });
            });
        } else {
            console.error('Video URL not found in the response.');
            sock.sendMessage(from, { text: "❌ Video URL not found in the response." }, { quoted: msg });
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        sock.sendMessage(from, { text: "❌ Error occurred while processing the request." }, { quoted: msg });
    }
};

module.exports.command = () => ({ cmd: ["facebook", "face"], handler });
