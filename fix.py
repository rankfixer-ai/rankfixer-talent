import re

with open('index.html', 'r', encoding='utf-8') as f:
    h = f.read()

# META
h = h.replace('<title>Job Copilot PH — Find Work in the Philippines | 3,500+ Jobs</title>', '<title>Job Copilot PH — Operational Workforce Platform | RankFixer Ecosystem</title>')
h = h.replace('Browse 3,500+ verified job openings in the Philippines. BPO, tech, remote, virtual assistant, and more. Free to search and apply. New jobs added daily.', 'A structured operational workforce platform connecting vetted Philippine talent with remote-ready employers. Part of the RankFixer managed staffing ecosystem.')
h = h.replace('<meta property="og:title" content="Job Copilot PH — Find Work in the Philippines">', '<meta property="og:title" content="Job Copilot PH — Operational Workforce Platform">')
h = h.replace('<meta property="og:description" content="Browse 3,500+ verified job openings in the Philippines. Free to search and apply.">', '<meta property="og:description" content="Structured operational workforce platform. Part of the RankFixer managed staffing ecosystem.">')
h = h.replace('https://jobcopilotph.vercel.app', 'https://jobs.rankfixer.co')

# LOGO
h = h.replace('>PH<span>Jobs</span></div>', '>Job Copilot <span>PH</span></div>')

# NAV
h = h.replace('id="nav-home"     onclick="go(\'home\')">Home</button>', 'id="nav-home"     onclick="go(\'home\')">Opportunities</button>')
h = h.replace('id="nav-search"   onclick="go(\'search\')">Browse Jobs</button>', 'id="nav-search"   onclick="go(\'search\')">Browse Roles</button>')
h = h.replace('Post a Job</button>', 'Post a Role</button>')
h = h.replace('>Sign Up</button>', '>Join Network</button>')
h = h.replace('Create Account', 'Join the Network')

# STATS
h = h.replace('<span class="stat-num">Free</span><div class="stat-label">To browse &amp; apply</div>', '<span class="stat-num">200</span><div class="stat-label">Seat Facility</div>')

# SEARCH
h = h.replace('placeholder="Search jobs, skills, keywords…"', 'placeholder="Search operational roles…"')
h = h.replace('placeholder="Job title, skill, keyword…"', 'placeholder="Search operational roles…"')
h = h.replace('>Remote only</label>', '>Remote Operations</label>')

# JOB CARDS
h = re.sub(r"\+\(isN\?'<span class=\"tag new-tag\">New</span>':''\)", '', h)
h = h.replace("isR?'<span class=\"tag remote\">Remote</span>':'')", "isR?'<span class=\"tag remote\">Remote Operations</span>':'')")
h = h.replace("'Job Board'", "'Operational Role'")

# EMPLOYER
h = h.replace('+ Post a Job</button>', '+ Post a Role</button>')
h = h.replace('Active job seekers', 'Active candidates')
h = h.replace('Remote seekers', 'Remote-ready')
h = h.replace('<span class="emp-stat-num">Free</span><div class="emp-stat-label">To post</div>', '<span class="emp-stat-num">Direct</span><div class="emp-stat-label">No intermediaries</div>')
h = h.replace('Post a New Job', 'Post a New Role')

# PROFILE
h = h.replace('<label class="f-label">Looking for</label><input class="f-input" id="p-jobtitle" placeholder="Virtual Assistant, CSR…"', '<label class="f-label">Target role / discipline</label><input class="f-input" id="p-jobtitle" placeholder="e.g. Executive Assistant, Marketing Operations…"')

# EMAIL
h = h.replace('hello@jobcopilotph.com', 'info@rankfixer.co')

# FOOTER
h = h.replace('Your go-to job board for finding work in the Philippines — BPO, tech, remote, and more. Free to search and apply.', 'Part of the RankFixer operational ecosystem — workforce intelligence, structured preparation, and professionally managed remote teams.')
h = h.replace('Quick Links', 'Talent Network')
h = h.replace('Browse by Category', 'Operational Structure')
h = h.replace("<li><button onclick=\"go('home')\">Home</button></li>", "<li><button onclick=\"go('home')\">Opportunities</button></li>")
h = h.replace("<li><button onclick=\"go('search')\">Browse Jobs</button></li>", "<li><button onclick=\"go('search')\">Browse Roles</button></li>")
h = h.replace("<li><button onclick=\"go('employer')\">Post a Job</button></li>", "<li><button onclick=\"go('employer')\">Post a Role</button></li>")
h = h.replace("<li><button onclick=\"qSearch('CSR')\">CSR / BPO</button></li>", "<li><button onclick=\"qSearch('Remote Operations')\">Remote Operations</button></li>")
h = h.replace("<li><button onclick=\"qSearch('Virtual Assistant')\">Virtual Assistant</button></li>", "<li><button onclick=\"qSearch('Client Support')\">Client Support</button></li>")
h = h.replace("<li><button onclick=\"qSearch('Remote')\">Remote / WFH</button></li>", "<li><button onclick=\"qSearch('AI-Assisted Workflows')\">AI-Assisted Workflows</button></li>")
h = h.replace("<li><button onclick=\"qSearch('Developer')\">Developer</button></li>", "<li><button onclick=\"qSearch('Marketing Operations')\">Marketing Operations</button></li>")
h = h.replace("<li><button onclick=\"qSearch('Data Entry')\">Data Entry</button></li>", "<li><button onclick=\"qSearch('Administrative Support')\">Administrative Support</button></li>")
h = h.replace('© 2025 Job Copilot PH. All rights reserved.', 'Part of the RankFixer Managed Staffing Ecosystem')

# ERRORS
h = h.replace('Could not load jobs.', 'Refreshing talent network…')
h = h.replace('<h3>No jobs yet</h3>', '<h3>Talent network syncing</h3>')
h = h.replace('<h3>No jobs found</h3>', '<h3>No matching roles</h3>')
h = h.replace('<p>Try different keywords.</p>', '<p>Try adjusting your search.</p>')
h = h.replace('<h3>No saved jobs</h3>', '<h3>No saved roles</h3>')
h = h.replace('Browse jobs and tap Save to add them here.', 'Browse roles and tap Save to add them here.')
h = h.replace('Sign in to see saved jobs', 'Sign in to see saved roles')
h = h.replace('<p>Job not found.</p>', '<p>Role not found.</p>')

# TOASTS
h = h.replace("toast('Welcome! 👋')", "toast('Welcome back.')")
h = h.replace("toast('Job saved!')", "toast('Role saved!')")

# MOBILE
h = h.replace('>Home<', '>Roles<')
h = h.replace('>Browse<', '>Search<')

# ADMIN
h = h.replace('Active jobs', 'Active roles')
h = h.replace('Remote jobs', 'Remote operations')

# AUTH MODAL
h = h.replace("Don't have an account? <span onclick=\"switchMode()\">Sign up free</span>", "No account yet? <span onclick=\"switchMode()\">Create one</span>")
h = h.replace("isL?'Don\\'t have an account? <span onclick=\"switchMode()\">Sign up free</span>'", "isL?'No account yet? <span onclick=\"switchMode()\">Create one</span>'")
h = h.replace("$('m-submit').textContent=isL?'Sign In':'Create Account';", "$('m-submit').textContent=isL?'Sign In':'Join the Network';")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(h)

print('Done.')
