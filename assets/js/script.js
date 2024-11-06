function convertPlainTextLinksToHtml(text) {
    /* Convert plain text links to HTML */

    // Capture URLs without trailing characters
    const urlRegex = /(?<!<a href=")https?:\/\/[^\s,()]+/g;
    
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}

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
