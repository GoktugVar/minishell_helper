class DocumentationManager {
constructor() {
	this.functions = [];
	this.container = document.getElementById('documentation-container');
	this.isLoading = false;
}

/**
 * Retrieves the list of JSON files from the data directory
 * @returns {Promise<string[]>} List of file names
 */
async loadFunctionsList() {
	const github = true;
	if (github) {
		const filesList = [
			'0_readline.json',
			'1_add_history.json',
			'2_rl_clear_history.json',
			'3_rl_on_new_line.json',
			'4_rl_replace_line.json',
			'5_rl_redisplay.json',
			'6_printf.json',
			'7_malloc.json',
			'8_free.json',
			'9_write.json',
			'10_access.json',
			'11_open.json',
			'12_read.json',
			'13_close.json',
			'14_fork.json',
			'15_wait.json',
			'16_waitpid.json',
			'17_wait3.json',
			'18_wait4.json',
			'19_signal.json',
			'20_sigaction.json',
			'21_sigemptyset.json',
			'22_sigaddset.json',
			'23_kill.json',
			'24_exit.json',
			'25_getcwd.json',
			'26_chdir.json',
			'27_stat.json',
			'28_lstat.json',
			'29_fstat.json',
			'30_unlink.json',
			'31_execve.json',
			'32_dup.json',
			'33_dup2.json',
			'34_pipe.json',
			'35_opendir.json',
			'36_readdir.json',
			'37_closedir.json',
			'38_strerror.json',
			'39_perror.json',
			'40_isatty.json',
			'41_ttyname.json',
			'42_ttyslot.json',
			'43_ioctl.json',
			'44_getenv.json',
			'45_tcsetattr.json',
			'46_tcgetattr.json',
			'47_tgetent.json',
			'48_tgetflag.json',
			'49_tgetnum.json',
			'50_tgetstr.json',
			'51_tgoto.json',
			'52_tputs.json',
			];
		return filesList;
	} else {
		try {
			const response = await fetch('data/');
			if (!response.ok) {
				throw new Error(`Unable to access data folder (HTTP ${response.status})`);
			}
		
			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');
		
			const fileLinks = Array.from(doc.querySelectorAll('a'))
				.map(a => a.href)
				.filter(href => href.endsWith('.json'))
				.map(href => href.split('/').pop());
		
			if (fileLinks.length === 0) {
				console.warn('No JSON files found in the data directory');
			}
		
			return fileLinks;
		} 
		catch (error) {
			console.error('Unable to retrieve folder list:', error);
			throw new Error(`Failed to load function list: ${error.message}`);
		}
	}
}

/**
 * Loads a specific function file
 * @param {string} filename - Name of the file to be loaded
 * @returns {Promise<Object>} Function data
 */
async loadFunctionData(filename) {
	try {
	const response = await fetch(`data/${filename}`);
	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}
	const funcData = await response.json();
	funcData.codeError = false;

	// Load the code file if specified
	if (funcData.codeFile) {
		try {
		funcData.code = await this.loadCodeFile(funcData.codeFile);
		} catch (codeError) {
		funcData.code = `${codeError.message}`;
		console.warn(`Unable to load code file ${funcData.codeFile}`, codeError);
		funcData.codeError = true;
		}
	}

	return funcData;
	} catch (error) {
	console.error(`Failed to load file ${filename}:`, error);
	throw new Error(`Failed to load ${filename}: ${error.message}`);
	}
}

/**
 * Loads the code example file
 * @param {string} filePath - Path of the code file
 * @returns {Promise<string>} Code content
 */
async loadCodeFile(filePath) {
	const response = await fetch(filePath);
	if (!response.ok) {
	throw new Error(`Failed to load code file (HTTP ${response.status})`);
	}
	return await response.text();
}

/**
 * Loads all function data
 * @returns {Promise<Array>} Array of function data
 */
async loadAllFunctionData() {
	try {
		const functionFiles = await this.loadFunctionsList();
		const loadedFunctions = await Promise.allSettled(
		functionFiles.map(filename => this.loadFunctionData(filename))
	);

	// Add successfully loaded functions to the array
	this.functions = loadedFunctions
		.filter(result => result.status === 'fulfilled')
		.map(result => result.value);

	// Warn about failed loads
	const failedFiles = loadedFunctions
		.filter(result => result.status === 'rejected')
		.length;

	if (failedFiles > 0) {
		console.warn(`${failedFiles} files failed to load`);
	}

	// Sort functions by ID - convert to number if possible for proper numeric sorting
	this.functions.sort((a, b) => {
		// If IDs are numeric, convert and compare as numbers
		const numA = parseInt(a.id);
		const numB = parseInt(b.id);
		
		if (!isNaN(numA) && !isNaN(numB)) {
		return numA - numB;
		}
		// Fall back to string comparison if not numeric
		return a.id.localeCompare(b.id);
	});

	return this.functions;
	} catch (error) {
	console.error('Failed to load all function data:', error);
	throw error;
	}
}

/**
 * Creates HTML content for the specified functions
 * @param {Array} functions - Array of functions to be processed
 * @returns {DocumentFragment} DOM fragment
 */
createFunctionsFragment(functions) {
	const fragment = document.createDocumentFragment();

	functions.forEach(func => {
	const functionEl = document.createElement('div');
	functionEl.className = 'function';

	functionEl.innerHTML = `
		<h3>${this.escapeHTML(func.name)}</h3>

		<div class="prototype">
		<div class="prototype-content">

			${func.library ? `
			<div class="include-section">
				<span class="include-icon">📚</span>
				<span class="include">#include</span>
				<span class="include-path">&lt;${this.escapeHTML(func.library)}&gt;</span>
			</div>
			` : ''}	

			${func.declaration ? `
			<p>
				<pre><code class="language-c">${this.escapeHTML(func.declaration)}</code></pre>
			</p>
			` : ''}
			
			
			${func.compileFlag ? `
			<div class="compile-flag-section">
				<span class="compile-flag-icon">🔧</span>
				<span class="compile-flag">${this.escapeHTML(func.compileFlag)}</span>
			</div>
			` : ''}					  
		</div>
		</div>

		<div class="description">
		<p>${this.formatDescription(func.description)}</p>
		</div>
		
		${func.code ? `
		<div class="example">
			<div class="code-wrapper">
			${func.codeError == false ? `
			<div class="code-actions">
				<button class="code-btn copy-btn" data-code="${this.escapeHTML(func.name)}" title="Kodu kopyala">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
				</button>
				<button class="code-btn download-btn" data-function-name="${this.escapeHTML(func.name)}" title="Kodu indir">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
				</button>
			</div>
			` : ''}
			<pre><code class="language-c" id="code-${this.escapeHTML(func.name).replace(/\s+/g, '-').toLowerCase()}">${this.formatCode(func.code)}</code></pre>
			</div>
		</div>
		` : ''}

		<div>
		<div class="return-value">
			<p>${this.formatDescription(func.return)}</p>
		</div>
		</div>
	`;

	fragment.appendChild(functionEl);
	});

	// Event listeners for download buttons
	setTimeout(() => {
	// Download buttons
	document.querySelectorAll('.download-btn').forEach(button => {
		button.addEventListener('click', (e) => {
		const functionName = e.currentTarget.getAttribute('data-function-name');
		const func = this.functions.find(f => f.name === functionName);
		if (func && func.code) {
			this.downloadCodeFile(func.code, `${functionName.toLowerCase().replace(/\s+/g, '_')}_example.c`);
		}
		});
	});

	// Copy buttons
	document.querySelectorAll('.copy-btn').forEach(button => {
		button.addEventListener('click', (e) => {
		const functionName = e.currentTarget.getAttribute('data-code');
		const codeElement = document.getElementById(`code-${functionName.replace(/\s+/g, '-').toLowerCase()}`);
		
		if (codeElement) {
			this.copyToClipboard(codeElement.textContent);
			
			// Visual feedback for copy
			const originalTitle = button.getAttribute('title');
			const originalSvg = button.innerHTML;
			button.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
			`;
			button.setAttribute('title', 'Kopyalandı!');
			button.classList.add('copied');
			
			setTimeout(() => {
			button.innerHTML = originalSvg;
			button.setAttribute('title', originalTitle);
			button.classList.remove('copied');
			}, 2000);
		}
		});
	});
	}, 0);

	return fragment;
}

/**
 * Copies text to clipboard
 * @param {string} text - Text to copy to clipboard 
 */
copyToClipboard(text) {
	navigator.clipboard.writeText(text).catch(err => {
	console.error('Could not copy text: ', err);
	
	// Fallback copy method
	const textarea = document.createElement('textarea');
	textarea.value = text;
	textarea.style.position = 'fixed';
	document.body.appendChild(textarea);
	textarea.focus();
	textarea.select();
	
	try {
		document.execCommand('copy');
	} catch (e) {
		console.error('Fallback copy failed:', e);
	}
	
	document.body.removeChild(textarea);
	});
}

/**
 * Downloads a code file
 * @param {string} codeContent - Content of the code file
 * @param {string} fileName - Name for the downloaded file
 */
downloadCodeFile(codeContent, fileName) {
	const blob = new Blob([codeContent], { type: 'text/plain' });
	const url = URL.createObjectURL(blob);
	
	const a = document.createElement('a');
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	
	// Clean up
	setTimeout(() => {
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
	}, 0);
}

/**
 * Renders all functions into the document
 */
renderAllFunctions() {
	if (this.functions.length === 0) {
	this.container.innerHTML = '<div class="info">No functions to display.</div>';
	return;
	}

	// Update the DOM in one operation
	const fragment = this.createFunctionsFragment(this.functions);
	this.container.innerHTML = '';
	this.container.appendChild(fragment);

	// Enable syntax highlighting (if using a library)
	if (window.hljs) {
	document.querySelectorAll('pre code').forEach(block => {
		hljs.highlightBlock(block);
	});
	}
}

/**
 * Formats description text into HTML paragraphs
 * @param {string} description - Text to be formatted
 * @returns {string} Formatted HTML
 */
formatDescription(description) {
	if (!description) return '';
	return this.escapeHTML(description)
	.replace(/\$\$/g, '</p><p>');
}

/**
 * Formats code text into safe HTML
 * @param {string} code - Code to be formatted
 * @returns {string} Formatted HTML
 */
formatCode(code) {
	if (!code) return '';
	return this.escapeHTML(code);
}

/**
 * Escapes text to make it safe for HTML
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
escapeHTML(text) {
	if (!text) return '';
	const div = document.createElement('div');
	div.textContent = text;
	return div.innerHTML;
}

/**
 * Shows loading indicator
 */
showLoading() {
	this.isLoading = true;
	this.container.innerHTML = '<div class="loading">Loading functions...</div>';
}

/**
 * Displays error message
 * @param {string} message - Error message
 */
showError(message) {
	this.isLoading = false;
	this.container.innerHTML = `<div class="error">
	<h3>An Error Occurred</h3>
	<p>${this.escapeHTML(message)}</p>
	<button onclick="location.reload()">Try Again</button>
	</div>`;
}

/**
 * Application initializer
 */
async init() {
	this.showLoading();

	try {
	await this.loadAllFunctionData();
	this.renderAllFunctions();
	this.isLoading = false;
	} catch (error) {
	console.error('Failed to load documentation:', error);
	this.showError(error.message || 'An error occurred while loading the documentation.');
	}
}
}

document.addEventListener('DOMContentLoaded', function() {
const docManager = new DocumentationManager();
docManager.init();
});
