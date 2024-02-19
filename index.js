const http = require("http");
const https = require("https");

const PORT = 5000;
const BASE_URL = "https://time.com";

function extractLatestStories(html) {
    const stories = [];
    let index = 0;
    // finding the start and last index from html which contain the latest stories.
    const start_index = html.indexOf('<h2 class="latest-stories__heading">', index);
    const last_index = html.indexOf('</ul>', start_index);
    // console.log(start_index,last_index)
    if (start_index === -1 || last_index === -1) {
        return stories;
    }

    // extracting the html which contain stories title and rest of the url
    const Require_Portion_html = html.substring(start_index, last_index + '</ul>'.length);
    // console.log("Require_Portion_html",Require_Portion_html)

    // now parse the Require_Portion_html and extract only story title and url of the story
    let story_index = 0;
    while (true) {
        // find the start and end index of content within <li> tag which contain 
        const story_start_index = Require_Portion_html.indexOf('<li', story_index);
        const story_end_index = Require_Portion_html.indexOf('</li>', story_start_index);
        if (story_start_index === -1 || story_end_index === -1) {
            break;
        }
        // find the content within <li> tag
        const story_html = Require_Portion_html.substring(story_start_index, story_end_index + '</li>'.length);
        // console.log("story_html",story_html);

        // Extract the title and link dynamically from the <li> content
        const titleStart1 = story_html.indexOf('<h3');
        const titleStart = story_html.indexOf('>', titleStart1);
        const titleEnd = story_html.indexOf('</h3>', titleStart);
        const title = story_html.substring(titleStart + 1, titleEnd).trim();
        // console.log("title=",title); 
        const linkStart = story_html.indexOf('href="');
        const linkEnd = story_html.indexOf('"', linkStart + 'href="'.length);
        const link = BASE_URL + story_html.substring(linkStart + 'href="'.length, linkEnd);

        // add the story to the list of stories
        stories.push({ title, link });

        // update the story_index to the next story
        story_index = story_end_index + '</li>'.length;
    }

    return stories.slice(0, 6); // return the first 6 stories
}

const server = http.createServer((req, res) => {
    
    if (req.url === "/getTimeStories" && req.method === "GET") {
        const url = 'https://time.com';   // base url
        // Initiates an HTTPS GET request to the url('https://time.com')
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            // event is emitted when a chunk of data is received from the server. The received data is appended to the data variabl
            response.on('end', () => {
                // call the extractLatestStories(data) which will return require result
                const result = extractLatestStories(data);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result, null, 4));
            });
        }).on('error', (error) => {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});