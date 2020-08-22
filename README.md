# Computational Seed Mix Design Demo Tool

[![](https://img.shields.io/badge/-Live%20demo-brightgreen)](https://phawthorne.github.io/computational-seed-mix-design/)

This interactive demo accompanies "Computational Seed Mix Design" (Barak, et al. 2021). This
is a visualization component of a larger tool we are developing that will allow interactive
building and optimization of seed mixes based on national data. 

This demo illustrates browsing through thousands of optimization outputs to identify mixes that meet
desired criteria.

## Demo documentation

### Mix pool objective values
The main panel consists of a scatter plot that shows objective values for every mix in the 25 species, $2500 max cost
run of the optimization. Controls for x- and y-axis allow the user to switch which objective scores are shown. The user
can click on a mix to select it.

### Filters
Filters allow the user to specify acceptable ranges for each of the objectives, which are reflected in the main 
scatter plot by graying out unacceptable mixes.

### Selected mix reports
Once a mix is selected, mix-specific report panels are populated:

- A "relative scores" graphic shows objective values for the selected mix, normalized to a scale of 0-1, 
where 0 corresponds to the lowest value for that objective across all optimized mixes, and 1 corresponds to the highest.
- A table lists the species included in the selected mix, and the quantity of each species, rounded to the nearest ounce.

## Summary
These various interfaces allow the user to explore the large pool of mixes to better understand patterns of tradeoffs
between different objectives, and to identify mixes meeting particular criteria. The larger tool under development
allows the user to export mixes of interest to their account, where they can edit them by adjusting seed weight for
included species, or by adding/removing species, and seeing how these changes affect the objective values with
live updating.
