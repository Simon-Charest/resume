function traverseAndConvert(element) {
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            
            if (text) {
                const convertedHtml = convertPlainTextLinksToHtml(text);
                
                if (convertedHtml !== text) {
                    const wrapper = document.createElement('span');
                    wrapper.innerHTML = convertedHtml;
                    node.replaceWith(wrapper);
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

    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}
