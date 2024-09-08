async function navigateTo(desiredURL) {
    const ourPromise = await fetch(desiredURL)
    const ourData = await ourPromise.text()
    const ourParser = new DOMParser()
    const ourDoc = ourParser.parseFromString(ourData, 'text/html')
    document.title = ourDoc.title
    document.querySelector(".container--narrow").innerHTML = ourDoc.querySelector(".container--narrow").innerHTML
}

function sameOrigin(a, b) {
    const urlA = new URL(a)
    const urlB = new URL(b)
    return urlA.origin === urlB.origin
}

export default function() {
    document.addEventListener("click", function(e) {
        if (e.target.tagName === "A") {
            if (sameOrigin(e.target.href, window.location)) {
                console.log("LINK")
                e.preventDefault()
                history.pushState(e.target.href, null, e.target.href)
                navigateTo(e.target.href)
            }
        }
    })
    window.addEventListener('popstate', function(e){
       navigateTo(e.state)
    })
}   