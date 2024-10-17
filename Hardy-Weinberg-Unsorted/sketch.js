let allele_array = [['A', 'a']];
let allele_weights = [0.5, 0.5];
let population_size = 100;
let graphical_population_size = 39600;

let population;
let offspringSpace;

const width = 400;
const height = 400;
let tileSize;

let weightAInput, weightaInput, populationSizeInput, generateButton;
let errorMessage;

function setup() {
  createCanvas(width, height);
  
  // Create input fields and labels
  let yPos = height + 10;
  
  createP('A weight:').position(10, yPos);
  weightAInput = createInput('0.5');
  weightAInput.position(120, yPos+15);
  weightAInput.size(50);
  
  yPos += 30;
  createP('a weight:').position(10, yPos);
  weightaInput = createInput('0.5');
  weightaInput.position(120, yPos+15);
  weightaInput.size(50);
  
  yPos += 30;
  createP('Population size:').position(10, yPos);
  populationSizeInput = createInput('100');
  populationSizeInput.position(120, yPos+15);
  populationSizeInput.size(50);
  
  // Create generate button
  yPos += 30;
  generateButton = createButton('Generate');
  generateButton.position(200, yPos-50);
  generateButton.mousePressed(generateOffspring);
  
  // Create error message paragraph
  yPos += 40;
  errorMessage = createP('');
  errorMessage.position(10, yPos);
  errorMessage.style('color', 'red');
  
  // Initial generation
  generateOffspring();
}

function draw() {
  // We don't need anything in the draw function as we're not animating
}

function generateOffspring() {
  // Get values from input fields
  let weightA = parseFloat(weightAInput.value());
  let weighta = parseFloat(weightaInput.value());
  population_size = parseInt(populationSizeInput.value());
  
  // Validate inputs
  if (isNaN(weightA) || isNaN(weighta) || isNaN(population_size)) {
    errorMessage.html("Invalid input. Please enter numbers.");
    return;
  }
  
  // Check if frequencies sum to 1
  if (Math.abs(weightA + weighta - 1) > 0.0001) {  // Using a small threshold for floating-point comparison
    errorMessage.html("A and a frequencies must sum to 1.");
    return;
  }
  
  // Clear error message if inputs are valid
  errorMessage.html('');
  
  allele_weights = [weightA, weighta];
  
  // Initialize population and generate offspring space
  population = Population.initialize(population_size, allele_array, [allele_weights]);
  offspringSpace = population.generateOffspringSpace();
  offspringSpace = subset(shuffle(offspringSpace),0,graphical_population_size)
  offspringSpace = shuffle(offspringSpace);
  
  // Calculate the optimal tile size
  tileSize = calculateTileSize(offspringSpace.length, width, height);
  
  console.log("Offspring space length:", offspringSpace.length);
  console.log("Calculated tile size:", tileSize);
  
  drawOffspringSpace();
}

function calculateTileSize(dataLength, canvasWidth, canvasHeight) {
  const side = Math.ceil(Math.sqrt(dataLength));
  return Math.floor(Math.min(canvasWidth, canvasHeight) / side);
}

function drawOffspringSpace() {
  background(240);
  
  const tilesPerRow = Math.floor(width / tileSize);
  
  for (let i = 0; i < offspringSpace.length; i++) {
    const x = (i % tilesPerRow) * tileSize;
    const y = Math.floor(i / tilesPerRow) * tileSize;
    
    const genotype = offspringSpace[i];
    const col = getGenotypeColor(genotype);
    
    noStroke();
    fill(col);
    rect(x, y, tileSize, tileSize);
  }
}

function getGenotypeColor(genotype) {
  switch (genotype) {
    case 'AA':
      return color(94, 128, 230);
    case 'Aa':
    case 'aA':
      return color(203, 55, 124);
    case 'aa':
      return color(240, 177, 64);
    default:
      return color(240, 228, 66);
  }
}
