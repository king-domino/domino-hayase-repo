class NyaaSource {
    constructor() {
        this.name = "Nyaa";
        this.baseURL = "https://nyaa.si";
    }

    async search(query) {
        // Construct the search URL. On Nyaa, searches look like: /?f=0&c=0_0&q=query
        const searchUrl = `${this.baseURL}/?f=0&c=0_0&q=${encodeURIComponent(query)}`;
        
        try {
            // Fetch the HTML from the website
            const response = await fetch(searchUrl);
            const html = await response.text();
            
            return this.parseHTML(html);
        } catch (error) {
            console.error("Failed to fetch from Nyaa:", error);
            return [];
        }
    }

    parseHTML(html) {
        const results = [];
        // Depending on Hayase's internal parsing engine, you might use a DOMParser
        // or a library like Cheerio if supported by the environment. 
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        
        // Nyaa's torrent rows are typically stored in a table row: <tr class="default/success/danger">
        const rows = doc.querySelectorAll('tr');

        rows.forEach(row => {
            const links = row.querySelectorAll('td:nth-child(2) a');
            if (links.length === 0) return;

            const titleElement = links[links.length - 1]; 
            const title = titleElement.getAttribute('title') || titleElement.textContent;

            const downloadLinks = row.querySelectorAll('td:nth-child(3) a');
            let magnet = "";
            downloadLinks.forEach(link => {
                if (link.href.startsWith("magnet:?")) {
                    magnet = link.href;
                }
            });

            const seeders = row.querySelector('td:nth-child(6)')?.textContent || "0";
            const leechers = row.querySelector('td:nth-child(7)')?.textContent || "0";

            const size = row.querySelector('td:nth-child(4)')?.textContent || "Unknown";

            if (magnet) {
                results.push({
                    title: title.trim(),
                    link: magnet,
                    seeders: parseInt(seeders),
                    leechers: parseInt(leechers),
                    size: size
                });
            }
        });

        return results;
    }
}

module.exports = new NyaaSource();
