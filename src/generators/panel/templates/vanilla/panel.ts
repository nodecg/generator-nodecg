import type { ExampleReplicant } from '../types/schemas';

// You can access the NodeCG api anytime from the `window.nodecg` object
// Or just `nodecg` for short. Like this!:
nodecg.log.info("Here's an example of using NodeCG's logging API!");

const exampleReplicant = nodecg.Replicant<ExampleReplicant>('exampleReplicant');
exampleReplicant.on('change', (newVal) => {
	console.log(newVal);
});
