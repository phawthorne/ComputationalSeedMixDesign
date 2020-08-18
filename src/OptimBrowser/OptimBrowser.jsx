import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './OptimBrowser.css';


const OptimBrowser = ({ panedata, setpane }) => {

  const figH = 600;
  const figW = 780;
  const margin = ({top:50, right:50, bottom: 50, left: 50});

  const [canvas, setCanvas] = useState(null);
  const [optimData, setOptimData] = useState(null);
  const [selectedMix, setSelectedMix] = useState(null);
  const [xAxisObjective, setXAxisObjective] = useState("cost");
  const [yAxisObjective, setYAxisObjective] = useState("bloom");
  const [costRange, setCostRange] = useState({min: 0, max: 100});
  const [bloomRange, setBloomRange] = useState({min: 0, max: 100});
  const [shannonRange, setShannonRange] = useState({min: 0, max: 100});
  const [consRange, setConsRange] = useState({min: 0, max: 100});
  const [phyloDistRange, setPhyloDistRange] = useState({min: 0, max: 100});
  const [costFilter, setCostFilter] = useState({min: 0, max: 100});
  const [bloomFilter, setBloomFilter] = useState({min: 0, max: 100});
  const [shannonFilter, setShannonFilter] = useState({min: 0, max: 100});
  const [consFilter, setConsFilter] = useState({min: 0, max: 100});
  const [phyloDistFilter, setPhyloDistFilter] = useState({min: 0, max: 100});

  /** Init the svg div */
  useEffect(() => {
    const c = d3.select("#plot-pane")
      .append("svg")
        .attr("width", figW)
        .attr("height", figH);
    setCanvas(c);
  }, [])

  /** Static graph component setup */
  useEffect(() => {
    if (canvas === null || optimData === null) {
      return;
    }
    const xmin = 0;
    const xmax = d3.max(optimData, d=>+d.cost);
    const xScale = d3.scaleLinear()
      .domain([xmin, xmax])
      .range([margin.left, figW - margin.right]);
    const xAxis = d3.axisBottom()
      .scale(xScale)
      .ticks(4);
    canvas.append("g")
      .attr("transform", `translate(0, ${figH - margin.bottom})`)
      .call(xAxis)
      .attr("stroke-width", 1.5)
      .attr("font-size", "12pt");
    canvas.append("text")
      .attr("transform", `translate(${figW/2}, ${figH - margin.bottom + 40})`)
      .style("text-anchor", "middle")
      .text(xAxisObjective);

    const ymin = 15;
    const ymax = d3.max(optimData, d=>+d.bloom);
    const yScale = d3.scaleLinear()
      .domain([ymin, ymax])
      .range([figH-margin.bottom, margin.top]);
    const yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(5);
    canvas.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .attr("stroke-width", 1.5)
      .attr("font-size", "12pt");
    canvas.append("text")
      .attr("transform", `translate(18, ${figH/2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text(yAxisObjective);
  }, [canvas, optimData, xAxisObjective, yAxisObjective])

  /** Load static data */
  useEffect(() => {
    async function fetchData() {
      const dataURL = process.env.PUBLIC_URL + "/static/data/scores.csv";
      console.log(dataURL);
      const data = await d3.csv(dataURL, function(d) {
        return {
          indiv: +d.indiv,
          cost: +d.cost,
          phylo_dist: +d.phylo_dist,
          bloom: +d.bloom,
          shannon: +d.shannon,
          consval: +d.consval,
          grass_spec_frac: +d.grass_spec_frac,
          grass_weight_frac: +d.grass_weight_frac
        }
      });
      setCostRange({
        min: Math.floor(d3.min(data, d=>+d.cost)), 
        max: Math.ceil(d3.max(data, d=>+d.cost))
      });
      setBloomRange({
        min: Math.floor(d3.min(data, d=>+d.bloom)), 
        max: Math.ceil(d3.max(data, d=>+d.bloom))
      });
      setShannonRange({
        min: Math.floor(d3.min(data, d=>+d.shannon)),
        max: Math.ceil(d3.max(data, d=>+d.shannon))
      });
      setConsRange({
        min: Math.floor(d3.min(data, d=>+d.consval)),
        max: Math.ceil(d3.max(data, d=>+d.consval))
      });
      setPhyloDistRange({
        min: Math.floor(d3.min(data, d=>+d.phylo_dist)),
        max: Math.ceil(d3.max(data, d=>+d.phylo_dist))
      });
      setCostFilter({
        min: Math.floor(d3.min(data, d=>+d.cost)), 
        max: Math.ceil(d3.max(data, d=>+d.cost))
      });
      setBloomFilter({
        min: Math.floor(d3.min(data, d=>+d.bloom)), 
        max: Math.ceil(d3.max(data, d=>+d.bloom))
      });
      setShannonFilter({
        min: Math.floor(d3.min(data, d=>+d.shannon)),
        max: Math.ceil(d3.max(data, d=>+d.shannon))
      });
      setConsFilter({
        min: Math.floor(d3.min(data, d=>+d.consval)),
        max: Math.ceil(d3.max(data, d=>+d.consval))
      });
      setPhyloDistFilter({
        min: Math.floor(d3.min(data, d=>+d.phylo_dist)),
        max: Math.ceil(d3.max(data, d=>+d.phylo_dist))
      });
      setOptimData(data);
      // setOptimData(data.slice(1,10));

    };
    fetchData();
  }, [])

  useEffect(() => {
    if (canvas === null || optimData === null){ return }
    updatePlot();
  }, [canvas, optimData, costFilter, bloomFilter, shannonFilter, consFilter, phyloDistFilter])

  function updatePlot() {
    var selectedPointID = selectedMix; // This is awkward - need to track 

    /** Axes */
    const xmin = 0;
    const xmax = d3.max(optimData, d=>+d.cost);
    const xScale = d3.scaleLinear()
      .domain([xmin, xmax])
      .range([margin.left, figW - margin.right]);
    const ymin = 15;
    const ymax = d3.max(optimData, d=>+d.bloom);
    const yScale = d3.scaleLinear()
      .domain([ymin, ymax])
      .range([figH-margin.bottom, margin.top]);

    function pointColor(pt) {
      if (pt.indiv === selectedPointID) { return "red" }
      else if (
        pt.bloom >= bloomFilter.min && pt.bloom <= bloomFilter.max &&
        pt.cost >= costFilter.min && pt.cost <= costFilter.max &&
        pt.shannon >= shannonFilter.min && pt.shannon <= shannonFilter.max &&
        pt.consval >= consFilter.min && pt.consval <= consFilter.max &&
        pt.phylo_dist >= phyloDistFilter.min && pt.phylo_dist <= phyloDistFilter.max
      ) {
        return "blue"
      }
      else {
        return "lightgray"
      }
    }
  
    function pointOpacity(pt) {
      return (pt.indiv === selectedPointID) ? 0.85 : 0.5;
    }
    
    const t = d3.transition()
      .duration(100);
    canvas.selectAll("circle")
      .data(optimData)
      .join(
        enter => enter.append("circle")
          .attr("cx", d => xScale(+d[xAxisObjective]))
          .attr("cy", d => yScale(+d[yAxisObjective]))
          .attr("r", 3)
          .attr("fill", d => pointColor(d))
          .attr("opacity", d => pointOpacity(d))
          .on('mouseover', function (d, i) {
            // d is the data object, i is the array index, and this is the svg element
            d3.select(this)
              .attr('opacity', 0.85)
              .attr("r", 5)
          })
          .on('mouseout', function (d, i) {
            d3.select(this)
              .attr('opacity', d => pointOpacity(d))
              .attr('r', 3)
          })
          .on('click', function(d, i) {
            setSelectedMix(d.indiv);
            selectedPointID = d.indiv;
            d3.select("#selected-point")
              .attr("id", null)
              .attr("fill", g => pointColor(g))
              .attr("opacity", g => pointOpacity(g));
            d3.select(this)
              .attr("fill", "red")
              .attr("opacity", 0.9)
              .attr("id", "selected-point");
          }),
        update => update.transition(t)
          .attr("fill", d => pointColor(d))
          .attr("opacity", d => pointOpacity(d)),
        exit => exit.remove()
      );

  }


  return (
    <div id="optim-browser">
    <div id="ob-slider-pane">
      <h2>Filters</h2>
      <Slider name="Cost" range={costRange} update={setCostFilter} />
      <Slider name="Bloom" range={bloomRange} update={setBloomFilter} />
      <Slider name="Shannon Diversity" range={shannonRange} update={setShannonFilter} />
      <Slider name="Conservatism" range={consRange} update={setConsFilter} />
      <Slider name="Phylo Dist" range={phyloDistRange} update={setPhyloDistFilter} />

    </div>
      
    <div id="ob-plot-pane">
      <h2>Scatter Plot</h2>
      <div id="plot-pane"></div>
    </div>

      <ReportPane mixid={selectedMix}/>
    </div>
  )
}



const Slider = ({name, range, update}) => {
  const[filterMin, setFilterMin] = useState(0);
  const[filterMax, setFilterMax] = useState(1);

  useEffect(() => {
    setFilterMin(range.min);
    setFilterMax(range.max);
  }, [range]);

  function handleMinChange(e) {
    setFilterMin(+e.currentTarget.value);
    update({min: +e.currentTarget.value, max: filterMax});
  }
  function handleMaxChange(e) {
    setFilterMax(+e.currentTarget.value);
    update({min: filterMin, max: +e.currentTarget.value});
  }

  return (
    <div className="slider">
      <div className="slider-header">
        <div className="slider-objective-name">{name}</div>
        <div className="slider-objective-range">({range.min}-{range.max})</div>
      </div>
      <div className="slider-input-row">
        Min: 
        <input type="text" className="slider-input" value={filterMin} onChange={handleMinChange}></input>
        Max: 
        <input type="text" className="slider-input" value={filterMax} onChange={handleMaxChange}></input>
      </div>
    </div>
  )
}


const ReportPane = ({ mixid }) => {
  const [open, setOpen] = useState(false);


  return(
    <div id="ob-report-pane">
      <div id='ob-report-table'>
        <h2>Report Pane</h2>
          Selected mix: {mixid}
      </div>
      {/* <div id='ob-report-save-button'>
        {mixid !== null && authenticationService.currentUserValue &&
          <button type="button" onClick={handleSaveButtonClick}>Save to project</button> }
      </div>
      <CopyMixDialog selectedMix={mixid} onClose={handleSaveDialogClose} open={open} /> */}
    </div>
  )
}


export { OptimBrowser }