import React from 'react';

export function <%- elementName %>() {
	return (
		<>
			<p>
				Hello, I'm one of the graphics in your bundle! I'm where you put the graphics you want to run in your
				broadcast software!
			</p>

			<p>
				To edit me, open "<span className="monospace">src/graphics/<%- elementName %>.tsx</span>" in your favorite text
				editor or IDE.
			</p>

			<p>You can use any libraries, frameworks, and tools you want. There are no limits.</p>

			<p>
				Visit{' '}
				<a href="https://nodecg.dev" target="_blank" rel="noopener">
					https://nodecg.dev
				</a>{' '}
				for full documentation.
			</p>

			<p>Have fun!</p>
		</>
	);
}
