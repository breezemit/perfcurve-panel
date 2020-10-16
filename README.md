# Grafana Plugin PerfCurve

PerfCurve is a grafana panel plugin to plot operation point of rotating machine, such as pump, compressor and etc., on a canvas with its performance curves.
You can draw multiple performance curves on the canvas only by giving sample points on the performance curve. The panel plugin connects sample points smoothly.

![Panel Example](./docs/img/panel_example.png "Panel Example")

## How to use PerfCurve?
### Axes setting
Specify Min., Max., Label, Unit and Decimals of X-Axis amd Y-Axis.
![Axes Setting](./docs/img/axes_setting.png "Axes Setting")

### Static curve setting
Add performance curves to the canvas by specifying sample points in comma separated value format.  
The number of values in X input box and Y input Box shall be same.
Natural curves are drawn based on the sample points.
![Static Curve Setting](./docs/img/static_curve_setting.png "Static Curve Setting")

### Plot setting
Set field names for X-Axis and Y-Axis to plot operating points.
Set Label, Color and Point Radius, too.  
Table format is recommended as query option.
![Plot Setting](./docs/img/plot_setting.png "Plot Setting")
![Query Example](./docs/img/query_example.png "Query Example")

### Dynamic curve setting (Advanced)
In case performance curve data is availble in database, they can be used to draw peformance curve which dynamically move based on the data. 
![Dynamic Curve Setting](./docs/img/dynamic_curve_setting.png "Dynamic Curve Setting")
![Query for Dynamic Curve](./docs/img/query_dynamic_curve.png "Query for Dynamic Curve")


## Getting started
1. Install dependencies
```BASH
yarn install
```
2. Build plugin in development mode or run in watch mode
```BASH
yarn dev
```
or
```BASH
yarn watch
```
3. Build plugin in production mode
```BASH
yarn build
```
