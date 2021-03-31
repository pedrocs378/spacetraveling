import { useEffect } from "react"

export function Comments() {

  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("inject-comments-for-uterances");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.async = true
    script.setAttribute("repo", "pedrocs378/spacetraveling-comments");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "blog-comment");
    script.setAttribute("theme", "github-dark");
    anchor.appendChild(script);
  }, [])

  return (
    <div id="inject-comments-for-uterances">
    </div>
  )
}
