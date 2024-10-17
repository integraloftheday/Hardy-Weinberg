class Genotype {
  constructor(allele_array, allele_weights = null, chrom1 = null, chrom2 = null) {
    this.allele_array = allele_array;
    this.length_geno = allele_array.length;
    
    // Initialize allele_weights if not provided
    if (allele_weights === null) {
      this.allele_weights = allele_array.map(alleles => {
        const equalWeight = 1 / alleles.length;
        return new Array(alleles.length).fill(equalWeight);
      });
    } else {
      this.allele_weights = allele_weights;
    }

    // Generate random chromosomes or use provided ones
    if (chrom1 === null && chrom2 === null) {
      this.chromosomeOne = this.generateRandomChromosome();
      this.chromosomeTwo = this.generateRandomChromosome();
    } else {
      this.chromosomeOne = chrom1;
      this.chromosomeTwo = chrom2;
    }
  }

  // Method to generate a random chromosome
  generateRandomChromosome() {
    return this.allele_array.map((alleles, index) => this.getWeightedRandomAllele(index));
  }

  // Method to get a random allele based on weights for a specific position
  getWeightedRandomAllele(position) {
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    
    for (let i = 0; i < this.allele_array[position].length; i++) {
      cumulativeWeight += this.allele_weights[position][i];
      if (randomValue < cumulativeWeight) {
        return this.allele_array[position][i];
      }
    }
    
    // In case of rounding errors, return the last allele
    return this.allele_array[position][this.allele_array[position].length - 1];
  }

  // Mutate the genotype at a random position
  mutate(mutationRate = 0.01) {
    this.chromosomeOne = this.chromosomeOne.map((gene, index) => 
      Math.random() < mutationRate ? this.getWeightedRandomAllele(index) : gene
    );
    this.chromosomeTwo = this.chromosomeTwo.map((gene, index) => 
      Math.random() < mutationRate ? this.getWeightedRandomAllele(index) : gene
    );
  }

  // Get the genotype as a string
  toString() {
    return `${this.chromosomeOne.join('')} | ${this.chromosomeTwo.join('')}`;
  }
}

class Individual {
  constructor(allele_array, allele_weights = null, chrom1 = null, chrom2 = null) {
    this.genotype = new Genotype(allele_array, allele_weights, chrom1, chrom2);
  }

  offspring_space(individual2) {
    const offspringSpace = [];
    
    for (let i = 0; i < this.genotype.length_geno; i++) {
      const alleles1 = [this.genotype.chromosomeOne[i], this.genotype.chromosomeTwo[i]];
      const alleles2 = [individual2.genotype.chromosomeOne[i], individual2.genotype.chromosomeTwo[i]];
      
      const combinations = [
        [alleles1[0], alleles2[0]],
        [alleles1[0], alleles2[1]],
        [alleles1[1], alleles2[0]],
        [alleles1[1], alleles2[1]]
      ];
      
      offspringSpace.push(combinations);
    }
    
    return offspringSpace;
  }

  generate_offsprings(number_of_offspring,parent2) {
    const offspringSpace = this.offspring_space(parent2);
    //console.log(offspringSpace);
    const offsprings = [];

    for (let i = 0; i < number_of_offspring; i++) {
      const newChrom1 = [];
      const newChrom2 = [];

      for (let j = 0; j < this.genotype.length_geno; j++) {
        const randomCombination = offspringSpace[j][Math.floor(Math.random() * 4)];
        newChrom1.push(randomCombination[0]);
        newChrom2.push(randomCombination[1]);
      }

      offsprings.push(new Individual(
        this.genotype.allele_array,
        this.genotype.allele_weights,
        newChrom1,
        newChrom2
      ));
    }

    return offsprings;
  }
}

class Population {
  constructor(individuals, allele_array) {
    this.allele_array = allele_array;
    this.individuals = individuals;
  }

  static initialize(population_size, allele_array, allele_weights = null) {
    const individuals = Array.from({ length: population_size }, () => 
      new Individual(allele_array, allele_weights)
    );
    return new Population(individuals, allele_array);
  }
  
  generateOffspringSpace() {
    const offspringSpace = [];
    var total = 0;
    for (let i = 0; i < this.individuals.length; i++) {
      for (let j = 0; j < this.individuals.length; j++) {
        //console.log(total++);
        if(i!=j){
        offspringSpace.push(...this.individuals[i].offspring_space(this.individuals[j]));
          }
      }
    }
    return offspringSpace.flatMap(combinations => 
    combinations.map(genotype => 
      genotype.sort().join('')
        )
      ).sort();
  }
  
  mate(number_of_offspring, size = null) {
    //const shuffled = this.individuals.sort(() => 0.5 - Math.random());
    const shuffled = shuffle(this.individuals);
    var newGeneration = [];
    if(size != null){
     number_of_offspring = Math.ceil(size / (this.individuals.length / 2))+1
    }
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      const parent1 = shuffled[i];
      const parent2 = shuffled[i + 1];
      const offsprings = parent1.generate_offsprings(number_of_offspring,parent2);
      newGeneration.push(...offsprings);
    }
    if(size != null){
      newGeneration = subset(shuffle(newGeneration),0,size);
    }

    // If there's an odd number of individuals, the last one doesn't mate
    if (shuffled.length % 2 !== 0) {
      newGeneration.push(shuffled[shuffled.length - 1]);
    }

    // Create and return a new Population with the offspring
    return new Population(newGeneration, this.allele_array);
  }

  selection(fitness_ratios) {
    this.individuals = this.individuals.filter(individual => {
      const genotype = individual.genotype.toString().replace(' | ', '');
      //console.log(genotype);
      const fitness = fitness_ratios[genotype] || 0;
      return Math.random() < fitness;
    });
  }

  calculatePopulationStats() {
    const stats = {
      allele_frequencies: [],
      population_size: this.individuals.length
    };

    for (let i = 0; i < this.allele_array.length; i++) {
      const alleleCount = {};
      this.allele_array[i].forEach(allele => alleleCount[allele] = 0);

      this.individuals.forEach(individual => {
        alleleCount[individual.genotype.chromosomeOne[i]]++;
        alleleCount[individual.genotype.chromosomeTwo[i]]++;
      });

      const totalAlleles = this.individuals.length * 2;
      const frequencies = {};
      for (const allele in alleleCount) {
        frequencies[allele] = alleleCount[allele] / totalAlleles;
      }

      stats.allele_frequencies.push(frequencies);
    }

    return stats;
  }
}
function sortGenotypes(space, p, q, width, tileSize) {
  let cords = [];
  let sortedSpace = [];
  let dim = Math.ceil(Math.sqrt(space.length));
  const tilesPerRow = Math.floor(width / tileSize);
  let dimP = Math.round(tilesPerRow * p);
  let dimQ = Math.round(tilesPerRow * q);
  let offspringSpaceOrdered = []; 
  
  for(let i = 0; i < space.length; i++){
    const x = (i % tilesPerRow);
    const y = Math.floor(i / tilesPerRow);
    
    if(x <= dimP && y <= dimQ){
      offspringSpaceOrdered.push("Aa")
      cords.push(['Aa', x, y]);
    }
    else if(x > dimP && y < dimQ){
      offspringSpaceOrdered.push("aa")
      cords.push(['aa', x, y]);
    }
    else if(x <= dimP && y > dimQ){
      offspringSpaceOrdered.push("AA")
      cords.push(['AA', x, y]);
    }
    else if(x > dimP && y >= dimQ){
      offspringSpaceOrdered.push("Aa")
      cords.push(['Aa', x, y]);
    }
  }

  // Trim the sorted space to match the original space length
  return offspringSpaceOrdered;
}
