function traverseAndConvert(element) {
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            
            if (text.trim()) {
                const convertedNode = convertPlainTextLinksToHtml(text);
                
                if (convertedNode) {
                    node.replaceWith(convertedNode);
                }
            }
        }
        
        else if (node.nodeType === Node.ELEMENT_NODE) {
            traverseAndConvert(node);
        }
    });
}

function convertPlainTextLinksToHtml(text) {
    /* Convert plain text links to HTML */

    // Regular expression to match URLs, ensuring trailing characters are handled properly
    const urlRegex = /(?<!<a href=")(https?:\/\/[^\s<>()"]+[\w/])/g;
    const matches = [...text.matchAll(urlRegex)];

    if (matches.length === 0) return null;

    const wrapper = document.createElement('span');
    let lastIndex = 0;

    matches.forEach(match => {
        const url = match[0];

        wrapper.append(document.createTextNode(text.slice(lastIndex, match.index)));

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'word-wrap-break-word';
        link.textContent = url;
        wrapper.append(link);

        lastIndex = match.index + url.length;
    });

    wrapper.append(document.createTextNode(text.slice(lastIndex)));

    return wrapper;
}
