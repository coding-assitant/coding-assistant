document.getElementById("new-conversation-btn").addEventListener("click",(function(){alert("New conversation created!")})),document.getElementById("sidebar-btn").addEventListener("mouseover",(function(){document.getElementById("sidebar").style.display="block"})),document.getElementById("sidebar-btn").addEventListener("click",(function(){document.getElementById("sidebar").style.display="block"})),document.getElementById("sidebar").addEventListener("mouseleave",(function(){document.getElementById("sidebar").style.display="none"}));const hoverZone=document.getElementById("hover-zone"),sidebar=document.getElementById("sidebar");hoverZone.addEventListener("mouseover",(()=>{sidebar.style.display="block"})),sidebar.addEventListener("mouseleave",(()=>{sidebar.style.display="none"}));