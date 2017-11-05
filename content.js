function consoleError(err) {
	console.error('%cReddit User Analyzer: ', 'color: #ff8b60;', err);
}

try {
	document.body.insertAdjacentHTML('beforeEnd', `
<div class="reddit-user-analysis">
	<style scoped>
		.reddit-user-analysis {
			--margin: 20px;
			--font-size: 14px;

			display: none;
			position: fixed;
			right: var(--margin);
			bottom: var(--margin);
			z-index: 1000000 !important;
			padding: 16px;
			width: 380px;
			height: 128px;
			background-color: rgba(0, 0, 0, 0.8);
			color: whitesmoke;
			font-size: var(--font-size) !important;
			border-radius: 16px;
		}

		.reddit-user-analysis * {
			margin: 0;
			padding: 0;
		}

		.reddit-user-analysis h1 {
			margin-bottom: 8px;
			font-size: calc(var(--font-size) * 1.25) !important;
		}
	</style>

	<h1 class="user-name"></h1>
	<p class="most-freq"></p>
</div>
`);

	const disp_analysis = document.getElementsByClassName('reddit-user-analysis')[0],
		disp_userName = disp_analysis.getElementsByClassName('user-name')[0],
		disp_mostFreq = disp_analysis.getElementsByClassName('most-freq')[0];

	const authors = [...document.getElementsByClassName('author')];

	const displayAnalysis = function () {
		fetch(this.href + '.json')
			.then(resp => resp.json())
			.then(j => {
				const userData = j.data,
					userActions = userData ? userData.children : 'Failed to fetch user data.',
					userName = userActions[0] && userActions[0] !== 'F' && userActions[0].data ? userActions[0].data.author : 'Failed to determine username.';

				if (userActions[0] !== 'F') {
					if (userName[0] !== 'F') {
						const comments = userActions
							.map((action) => action.data.body)
							.filter((comment) => !!comment);

						disp_analysis.style.transition = 'none';
						disp_analysis.style.opacity = 1;
						disp_analysis.style.display = 'block';

						disp_userName.textContent = 'u/' + userName;

						if (comments.length > 0) {
							const freqMap = {},
								wordArray = comments
									.join(' ')
									.toLowerCase()
									.replace(/[^a-zA-Z\s]|\n|\r/gm, '')
									.split(' ')
									// filter out certain words
									.filter(word => !/^$|\s+|a|an|are|b|be|but|c|do|from|for|gt|he|her(s?)|his|i|is|it|just|lt|me|my|not|of|on|or|she|so|the|this|those|to|very|was|were|you/.test(word));

							let highestFreq = 0,
								mostFreqWord;

							for (let i = 0; i < wordArray.length; i++) {
								if (wordArray[i] in freqMap) {
									freqMap[wordArray[i]]++;

									if (freqMap[wordArray[i]] > highestFreq) {
										highestFreq = freqMap[wordArray[i]];
										mostFreqWord = wordArray[i];
									}
								} else {
									freqMap[wordArray[i]] = 1;
								}
							}

							disp_mostFreq.textContent = `Most frequent word used lately: "${mostFreqWord || '! all !'}"`;
						} else {
							disp_mostFreq.textContent = `No comments found for ${userName}.`;
						}
					} else {
						consoleError(userName);
					}
				} else {
					consoleError(userActions);
				}
			})
			.catch(err => consoleError('Error fetching user data. ERROR: ' + err));
	};

	const hideAnalysis = function () {
		// disp_analysis.style.transition = 'opacity 666ms linear';
		// disp_analysis.style.opacity = 0;

		// setTimeout(() => {
		// 	disp_analysis.style.display = 'none';
		// 	disp_userName.textContent = null;
		// }, 1000);
	};

	authors.forEach((author) => author.addEventListener('mouseover', displayAnalysis));
	authors.forEach((author) => author.addEventListener('mouseleave', hideAnalysis));
} catch (err) {
	consoleError('CATASTROPHIC FAILURE!!! ERROR: ' + err);
}