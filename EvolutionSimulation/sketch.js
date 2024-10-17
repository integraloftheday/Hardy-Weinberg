let population;
let alleleFrequenciesA = [];
let alleleFrequenciesa = [];
let populationSizes = [];
let generations = 100;
let currentGeneration = 0;
let runSimulationBool = false;

// Input elements
let initialFreqInputA, initialFreqInputa, popSizeInput, offspringInput, genInput;
let AAFitnessInput, aaFitnessInput, AaFitnessInput;
let startButton, runButton, stepButton;

function setup() {
  createCanvas(400, 250);
  
  // Create input elements
  initialFreqInputA = createInput('0.5');
  initialFreqInputA.position(10, 10);
  createP('Initial A allele frequency').position(210, 0);
  
  initialFreqInputa = createInput('0.5');
  initialFreqInputa.position(10, 40);
  createP('Initial a allele frequency').position(210, 30);
  
  popSizeInput = createInput('1000');
  popSizeInput.position(10, 70);
  createP('Population size').position(210, 60);
  
  aaFitnessInput = createInput('1');
  aaFitnessInput.position(10, 100);
  createP('aa Fitness').position(210, 90);
  
  AAFitnessInput = createInput('1');
  AAFitnessInput.position(10, 130);
  createP('AA Fitness').position(210, 120);
  
  AaFitnessInput = createInput('1');
  AaFitnessInput.position(10, 160);
  createP('Aa Fitness').position(210, 150);
  
  genInput = createInput('100');
  genInput.position(10, 190);
  createP('Number of generations').position(210, 180);
  
  startButton = createButton('Initialize Simulation');
  startButton.position(10, 220);
  startButton.mousePressed(initializeSimulation);

  runButton = createButton('Run Simulation');
  runButton.position(150, 220);
  runButton.mousePressed(runSimulation);
  runButton.attribute('disabled', '');

  stepButton = createButton('Generate Step');
  stepButton.position(270, 220);
  stepButton.mousePressed(generateStep);
  stepButton.attribute('disabled', '');

  // Create Plotly graph divs
  let alleleFreqDiv = createDiv('');
  alleleFreqDiv.id('alleleFreqPlot');
  alleleFreqDiv.position(10, 280);
  alleleFreqDiv.style('width', '600px');
  alleleFreqDiv.style('height', '400px');

  let popSizeDiv = createDiv('');
  popSizeDiv.id('popSizePlot');
  popSizeDiv.position(620, 320);
  popSizeDiv.style('width', '600px');
  popSizeDiv.style('height', '400px');
}

function draw() {
  background(220);
  
  if(runSimulationBool){
    generateStep();
    updatePlots();
    currentGeneration ++;
  }
  if(currentGeneration > generations){
    runSimulationBool = false;
  }
  
}

function initializeSimulation() {
  const initialFreqA = parseFloat(initialFreqInputA.value());
  const initialFreqa = parseFloat(initialFreqInputa.value());
  
  const popSize = parseInt(popSizeInput.value());
  generations = parseInt(genInput.value());
  
  const allele_array = [['A', 'a']];
  const allele_weights = [[initialFreqA, initialFreqa]];
  
  population = Population.initialize(popSize, allele_array, allele_weights);
  
  alleleFrequenciesA = [];
  alleleFrequenciesa = [];
  populationSizes = [];
  currentGeneration = 0;

  // Enable the Run and Step buttons
  runButton.removeAttribute('disabled');
  stepButton.removeAttribute('disabled');

  // Generate initial stats
  generateStep();
}

function runSimulation() {
  runSimulationBool = true;
}

function generateStep() {
    const AAFitness = parseFloat(AAFitnessInput.value());
    const aaFitness = parseFloat(aaFitnessInput.value());
    const AaFitness = parseFloat(AaFitnessInput.value());
    
    const stats = population.calculatePopulationStats();
    alleleFrequenciesA.push(stats.allele_frequencies[0]['A']);
    alleleFrequenciesa.push(stats.allele_frequencies[0]['a']);
    populationSizes.push(stats.population_size);
  
    let mateNumber = Math.ceil(parseInt(popSizeInput.value()) / (population.individuals.length *0.5))+1
  
    
    population = population.mate(mateNumber);
    population.individuals = subset(shuffle(population.individuals),0,popSizeInput.value());
    const fitness_ratios = {
      'AA': AAFitness, 'aa': aaFitness, 'Aa': AaFitness, 'aA': AaFitness
    };
    population.selection(fitness_ratios);
    currentGeneration++;

    updatePlots();

  
}

function updatePlots() {
  // Allele Frequency Plot
  let alleleFreqTraceA = {
    x: Array.from({length: alleleFrequenciesA.length}, (_, i) => i),
    y: alleleFrequenciesA,
    mode: 'lines',
    name: 'Allele A Frequency'
  };

  let alleleFreqTracea = {
    x: Array.from({length: alleleFrequenciesa.length}, (_, i) => i),
    y: alleleFrequenciesa,
    mode: 'lines',
    name: 'Allele a Frequency'
  };

  let alleleFreqLayout = {
    title: 'Allele Frequencies Over Generations',
    xaxis: {title: 'Generation'},
    yaxis: {title: 'Frequency', range: [0, 1]}
  };

  Plotly.newPlot('alleleFreqPlot', [alleleFreqTraceA, alleleFreqTracea], alleleFreqLayout);

  // Population Size Plot
  let popSizeTrace = {
    x: Array.from({length: populationSizes.length}, (_, i) => i),
    y: populationSizes,
    mode: 'lines',
    name: 'Population Size'
  };

  let popSizeLayout = {
    title: 'Population Size Over Generations',
    xaxis: {title: 'Generation'},
    yaxis: {title: 'Population Size'}
  };

  //Plotly.newPlot('popSizePlot', [popSizeTrace], popSizeLayout);
}

// Population and Individual classes go here
// (Include the classes from your previous code)
