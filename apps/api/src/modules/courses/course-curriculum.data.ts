export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'Video Lecture' | 'Interactive Walkthrough' | 'Hands-on Practice' | 'Knowledge Assessment';
  videoUrl: string; // Embeddable YouTube or HTML5 URL
  desc: string;
  learningObjectives?: string[];
  notes?: string;
}

export interface CourseCurriculum {
  summary: string;
  instructor?: string;
  institution?: string;
  modules: Lesson[];
}

export const COURSE_CURRICULA: Record<string, CourseCurriculum> = {
  // 1. Fundamentals of Statistical Inference
  'Fundamentals of Statistical Inference': {
    summary: 'Master the theoretical and practical foundations of statistical inference, hypothesis testing, confidence intervals, and p-value interpretations essential for official statistical production in MoSPI.',
    instructor: 'Prof. P.C. Mahalanobis Statistical Chair',
    institution: 'Indian Statistical Institute & MoSPI Academy',
    modules: [
      {
        id: 'inf-1',
        title: 'Lecture 1: Probability Distributions & Sampling Distributions',
        duration: '18 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/oHcrna8FBlM', // Central Limit Theorem & Normal Distribution
        desc: 'Detailed examination of normal, Student t, binomial, and Poisson distributions with central limit theorem proofs and applications in survey sampling.',
        learningObjectives: [
          'Understand properties of standard probability distributions',
          'Calculate z-scores and Student-t statistics from sample microdata',
          'Apply the Central Limit Theorem to government census samples',
        ],
        notes: 'Formula: Z = (X̄ - μ) / (σ / √n). When population variance σ is unknown, use Sample Standard Deviation S with (n - 1) degrees of freedom.',
      },
      {
        id: 'inf-2',
        title: 'Lecture 2: Point Estimation & Confidence Intervals',
        duration: '22 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/tFWsuO9f74o', // Confidence Intervals Explained
        desc: 'Unbiased estimators, efficiency, consistency, and 90%/95%/99% confidence interval construction for population proportions and means.',
        learningObjectives: [
          'Construct two-sided and one-sided confidence intervals',
          'Evaluate margin of error vs sample size trade-offs in surveys',
        ],
        notes: '95% Confidence Interval for μ = X̄ ± 1.96 * (σ / √n).',
      },
      {
        id: 'inf-3',
        title: 'Interactive Lab: Null Hypothesis Testing & P-Value Interpretation',
        duration: '25 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/0oc49DyA3hU', // Hypothesis Testing
        desc: 'Formulate null (H0) and alternative (H1) hypotheses, Type I vs Type II errors, statistical significance thresholds (alpha = 0.05, 0.01), and two-tailed tests.',
        learningObjectives: [
          'Distinguish between statistical significance and practical significance',
          'Avoid common misinterpretations of p-values in policy briefs',
        ],
        notes: 'Reject H0 when p-value < α. Failing to reject H0 is NOT proof that H0 is true; it indicates insufficient evidence against it.',
      },
      {
        id: 'inf-4',
        title: 'Practical Exercise: ANOVA & Chi-Square Tests in Official Data',
        duration: '30 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/ITf4vHhyGpc', // Chi-Square Tests
        desc: 'Contingency tables, Pearson Chi-Square tests of independence, and One-Way ANOVA across socio-economic geographical strata.',
        learningObjectives: [
          'Perform Chi-Square goodness-of-fit on demographic categories',
          'Interpret F-statistics and degrees of freedom in multi-group surveys',
        ],
      },
      {
        id: 'inf-5',
        title: 'Formative Assessment: Competency Verification Quiz',
        duration: '15 mins',
        type: 'Knowledge Assessment',
        videoUrl: 'https://www.youtube-nocookie.com/embed/oHcrna8FBlM',
        desc: 'Validate key concepts in statistical inference to update your SkillTwin vector model.',
      },
    ],
  },

  // 2. Survey Design Masterclass
  'Survey Design Masterclass': {
    summary: 'Comprehensive methodology for creating reliable, robust national surveys, from sampling frames and questionnaire design to field pilot testing and non-sampling error control.',
    instructor: 'National Sample Survey Office (NSSO) Director',
    institution: 'National Statistical Systems Training Academy (NSSTA)',
    modules: [
      {
        id: 'surv-1',
        title: 'Module 1: Survey Frame Development & Primary Sampling Units',
        duration: '24 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/G3flK6K31c4', // Survey Design
        desc: 'Constructing exhaustive sampling frames, enumeration blocks, urban frame survey (UFS) blocks, and rural village registers.',
        learningObjectives: [
          'Identify frame defects such as undercoverage and duplicate units',
          'Define Primary Sampling Units (PSUs) and Ultimate Sampling Units (USUs)',
        ],
      },
      {
        id: 'surv-2',
        title: 'Module 2: Questionnaire Architecture & Cognitive Pre-testing',
        duration: '20 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/V6mGZk3Qk0E', // Questionnaire Design
        desc: 'Formulating unambiguous question wording, recall period calibration, skip logic, and pre-testing using cognitive interview techniques.',
        learningObjectives: [
          'Design skip-patterns and validation checks for CAPI/PAPI tools',
          'Minimize respondent fatigue and social desirability bias',
        ],
      },
      {
        id: 'surv-3',
        title: 'Module 3: CAPI Systems & Computer-Assisted Interviewing',
        duration: '28 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/Wb3cxQdYq2w', // Data collection
        desc: 'Implementing tablet-based field collection, GPS geolocation stamping, paradata capture, and real-time validation checks.',
      },
      {
        id: 'surv-4',
        title: 'Module 4: Non-Sampling Errors & Field Quality Audits',
        duration: '25 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/0oc49DyA3hU',
        desc: 'Quantifying and mitigating non-response bias, interviewer effects, and data entry discrepancies in multi-round national surveys.',
      },
    ],
  },

  // 3. Stratified & Cluster Sampling Techniques
  'Stratified & Cluster Sampling Techniques': {
    summary: 'Rigorous mathematical and operational treatment of probability sampling designs, design effects (DEFF), intra-class correlation, and optimal allocation across heterogeneous strata.',
    instructor: 'Lead Sampling Statistician',
    institution: 'MoSPI Sampling Design Division',
    modules: [
      {
        id: 'samp-1',
        title: 'Session 1: Stratified Random Sampling & Neyman Allocation',
        duration: '26 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/pT7kF6lK8lQ', // Stratified Sampling
        desc: 'Partitioning populations into homogeneous strata, proportional vs optimal Neyman allocation, and variance reduction formulas.',
        notes: 'Neyman Allocation: n_h = n * (N_h * S_h) / Σ(N_i * S_i). Allocates more sample units to larger and more variable strata.',
      },
      {
        id: 'samp-2',
        title: 'Session 2: Single-Stage and Multi-Stage Cluster Sampling',
        duration: '22 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/yZUPc2r5jA8', // Cluster Sampling
        desc: 'Probability Proportional to Size (PPS) sampling, intra-cluster correlation coefficient (roh), and calculating Design Effects (DEFF).',
        notes: 'DEFF = 1 + (m - 1) * ρ, where m is average cluster size and ρ is intraclass correlation.',
      },
      {
        id: 'samp-3',
        title: 'Session 3: Weighting, Calibration & Non-Response Adjustments',
        duration: '30 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/G3flK6K31c4',
        desc: 'Design weights (base weights), non-response weight adjustment factors, and post-stratification calibration using national census totals.',
      },
      {
        id: 'samp-4',
        title: 'Session 4: Practical Case Study on National Household Sample',
        duration: '35 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/oHcrna8FBlM',
        desc: 'Estimate national consumer expenditure aggregates and calculate standard errors using Taylor linearization.',
      },
    ],
  },

  // 4. Data Visualization with Python & Power BI
  'Data Visualization with Python & Power BI': {
    summary: 'Design executive-grade dashboards and statistical visualizations using matplotlib, seaborn, plotly, and Microsoft Power BI for public data dissemination.',
    instructor: 'Data Visualization Specialist',
    institution: 'iGOT Karmayogi & Digital India',
    modules: [
      {
        id: 'vis-1',
        title: 'Module 1: Principles of Effective Visual Communication',
        duration: '20 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/3nL2_Qn4kzA', // Data Viz Principles
        desc: 'Tufte principles of graphical integrity, data-ink ratio, color theory for accessible visualization, and choosing the right chart type.',
      },
      {
        id: 'vis-2',
        title: 'Module 2: Python Data Visualization (Seaborn & Plotly)',
        duration: '32 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/a9UrKTVEeZA', // Seaborn Python
        desc: 'Creating distribution plots, heatmaps, boxplots, multi-faceted pairplots, and interactive Plotly choropleth maps.',
      },
      {
        id: 'vis-3',
        title: 'Module 3: Building Interactive Dashboards in Power BI',
        duration: '38 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/AGrl-H87pRU', // Power BI Tutorial
        desc: 'Importing MoSPI CSV/database data, defining DAX measures, building KPI cards, slicers, cross-filtering, and automated report publishing.',
      },
      {
        id: 'vis-4',
        title: 'Module 4: Geospatial & Thematic Mapping for States/Districts',
        duration: '25 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/6iW_lA4N_vI',
        desc: 'Linking shapefiles with state-level indicators to produce official thematic heatmaps for national publications.',
      },
    ],
  },

  // 5. SQL for Government Data Systems
  'SQL for Government Data Systems': {
    summary: 'Master SQL for querying, aggregating, and joining massive census and survey databases. Covers window functions, indexing, CTEs, and relational database management.',
    instructor: 'Senior Database Architect',
    institution: 'National Informatics Centre (NIC)',
    modules: [
      {
        id: 'sql-1',
        title: 'Lesson 1: Relational Modeling & Complex Multi-Table Joins',
        duration: '28 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/HXV3zeRR3h4', // SQL Tutorial
        desc: 'INNER JOIN, LEFT JOIN, FULL OUTER JOIN, self joins, and relational integrity constraints in administrative databases.',
      },
      {
        id: 'sql-2',
        title: 'Lesson 2: Advanced Aggregations, GROUP BY & HAVING Clauses',
        duration: '25 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/7S_tz1z_5bA', // SQL Aggregation
        desc: 'Group-level summary statistics, conditional COUNT(CASE WHEN ...), multi-column groupings, and subquery filtering.',
      },
      {
        id: 'sql-3',
        title: 'Lesson 3: Analytic & Window Functions (OVER, PARTITION BY, RANK)',
        duration: '32 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/Ww71knvhQ-s', // Window Functions
        desc: 'Calculating cumulative running totals, moving averages, ROW_NUMBER(), DENSE_RANK(), and lead/lag differences without self-joins.',
      },
      {
        id: 'sql-4',
        title: 'Lesson 4: Query Optimization, Indexing & Execution Plans',
        duration: '25 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/BHwzDmx62eY',
        desc: 'Using EXPLAIN ANALYZE, creating B-Tree composite indexes, handling table partition pruning, and optimizing slow survey queries.',
      },
    ],
  },

  // 6. Machine Learning for Statistical Applications
  'Machine Learning for Statistical Applications': {
    summary: 'Apply supervised and unsupervised machine learning algorithms to official data for automated outlier detection, missing value imputation, and macroeconomic forecasting.',
    instructor: 'Head of AI & Data Science',
    institution: 'MoSPI AI Innovation Cell',
    modules: [
      {
        id: 'ml-1',
        title: 'Lecture 1: Supervised Regression & Regularization (Lasso/Ridge)',
        duration: '30 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/7eh4d6sabA0', // Regression & Machine Learning
        desc: 'Ordinary Least Squares regression, multicollinearity diagnostics (VIF), L1/L2 regularization for high-dimensional survey datasets.',
      },
      {
        id: 'ml-2',
        title: 'Lecture 2: Classification Models & Tree-Based Ensembles',
        duration: '35 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/Gv9_4yMHFhI', // Random Forest
        desc: 'Decision Trees, Random Forests, and XGBoost for classifying household poverty bands and industrial establishment categories.',
      },
      {
        id: 'ml-3',
        title: 'Lecture 3: Unsupervised Clustering & Anomaly Detection',
        duration: '28 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/4b5d3muPQmA', // K-Means Clustering
        desc: 'K-Means clustering, DBSCAN, and Isolation Forests to automatically detect fraudulent enumerations and survey outliers.',
      },
      {
        id: 'ml-4',
        title: 'Lecture 4: Machine Learning Pipelines in Production',
        duration: '25 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/0GhyxR_e11g',
        desc: 'Cross-validation, hyperparameter grid search, pipeline serialization, and continuous model performance monitoring.',
      },
    ],
  },

  // 7. Python for Data Analysis
  'Python for Data Analysis': {
    summary: 'Practical Python programming for official statisticians: pandas dataframes, vectorization with NumPy, data cleaning, merge/reshape operations, and statistical modeling.',
    instructor: 'Lead Python Data Engineer',
    institution: 'iGOT Karmayogi & Indian Statistical Institute',
    modules: [
      {
        id: 'py-1',
        title: 'Chapter 1: NumPy Arrays & Vectorized Computation',
        duration: '20 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/QUT1VHiLmmI', // NumPy
        desc: 'Array creation, broadcasting rules, matrix math, slicing, and memory-efficient numerical operations in Python.',
        learningObjectives: [
          'Create 1D, 2D, and N-dimensional ndarrays with optimal dtypes',
          'Utilize vectorized arithmetic and NumPy ufuncs for fast batch calculations',
          'Apply boolean masking to filter million-row arrays without loops',
        ],
        notes: 'Broadcasting rule: Two dimensions are compatible when they are equal, or one of them is 1.',
      },
      {
        id: 'py-2',
        title: 'Chapter 2: Pandas DataFrames, Slicing & Data Cleaning',
        duration: '35 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/vmEHCJofslg', // Pandas
        desc: 'Loading survey microdata, indexing with .loc/.iloc, column transformations, missing value imputation, and categorical encoding.',
        learningObjectives: [
          'Read and parse large MoSPI CSV microdata files into pandas DataFrames',
          'Handle missing values using .dropna(), .fillna(), and domain-specific median imputation',
          'Transform timestamps, text columns, and create derived metric columns',
        ],
        notes: 'Best Practice: Use inplace=False and method chaining for immutable, reproducible transformation pipelines.',
      },
      {
        id: 'py-3',
        title: 'Chapter 3: Reshaping, Pivot Tables & Group Aggregations',
        duration: '28 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/tcRGOZ48gCg', // Pandas Reshaping
        desc: 'Using .groupby(), .agg(), pd.melt(), and .pivot_table() to compute cross-tabulations and summary tables matching official publications.',
        learningObjectives: [
          'Aggregate state and district survey data with multi-metric dictionaries',
          'Generate cross-tabulations and pivot tables for census reports',
          'Reshape wide-format survey returns to tidy long-format for analytical ingestion',
        ],
        notes: 'Syntax: df.groupby([\"State\", \"Sector\"]).agg({\"Income\": [\"mean\", \"median\"], \"Weight\": \"sum\"})',
      },
      {
        id: 'py-4',
        title: 'Chapter 4: Statistical Modeling with Statsmodels & Verification',
        duration: '26 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/1O_BenficgE', // Statsmodels
        desc: 'Running OLS regression models, extracting R-squared, standard errors, p-values, and conducting hypothesis tests in Python.',
        learningObjectives: [
          'Fit ordinary least squares (OLS) regression models with statsmodels.formula.api',
          'Diagnose multicollinearity via Variance Inflation Factors (VIF)',
          'Interpret regression coefficients and confidence intervals for policy briefs',
        ],
        notes: 'Key Output: Inspect model.summary() p-values (P > |t| < 0.05) to verify statistical significance.',
      },
    ],
  },

  // 8. GIS & Spatial Analysis for Census Operations
  'GIS & Spatial Analysis for Census Operations': {
    summary: 'Geographic Information Systems for statistical and census administration: QGIS, spatial joins, Moran I spatial autocorrelation, and thematic population mapping.',
    instructor: 'Geospatial Advisor',
    institution: 'MoSPI GIS & Remote Sensing Division',
    modules: [
      {
        id: 'gis-1',
        title: 'Module 1: Foundations of Spatial Data, CRS & GeoJSON',
        duration: '25 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/kCIOr46x_vY', // QGIS Intro
        desc: 'Coordinate Reference Systems (CRS), EPSG codes, shapefiles, GeoJSON, and vector layer geometries.',
      },
      {
        id: 'gis-2',
        title: 'Module 2: Spatial Joins & Attribute Aggregations in QGIS',
        duration: '30 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/2X4aW4rT70c',
        desc: 'Joining administrative census data with district and sub-district boundary polygons for spatial aggregation.',
      },
      {
        id: 'gis-3',
        title: 'Module 3: Spatial Autocorrelation & Hotspot Analysis',
        duration: '32 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/yZUPc2r5jA8',
        desc: 'Calculating Global Moran I, Local Indicators of Spatial Association (LISA), and identifying geographical clusters of poverty or employment.',
      },
    ],
  },
};

/**
 * Returns the rich curriculum for a course by title, or generates a realistic domain curriculum if title is not explicitly predefined.
 */
export function getCourseCurriculum(courseTitle: string, provider: string, difficulty: string): CourseCurriculum {
  if (COURSE_CURRICULA[courseTitle]) {
    return COURSE_CURRICULA[courseTitle];
  }

  // Generate realistic, rich curriculum for other course titles
  return {
    summary: `Comprehensive professional curriculum in ${courseTitle}. Designed for civil servants, analysts, and officers to acquire verified domain competencies.`,
    instructor: 'Senior Domain Faculty & MoSPI Experts',
    institution: provider === 'IGOT' ? 'iGOT Karmayogi Government Academy' : 'National Statistical Systems Training Academy',
    modules: [
      {
        id: 'gen-1',
        title: `Module 1: Foundations & Architecture of ${courseTitle}`,
        duration: '22 mins',
        type: 'Video Lecture',
        videoUrl: 'https://www.youtube-nocookie.com/embed/oHcrna8FBlM',
        desc: `Core concepts, regulatory frameworks, operational benchmarks, and government standards related to ${courseTitle}.`,
        learningObjectives: [
          `Understand key definitions and official terminology in ${courseTitle}`,
          'Identify compliance requirements and quality parameters',
        ],
        notes: `Operational Guideline: Always maintain reproducible data audit trails when applying ${courseTitle} procedures.`,
      },
      {
        id: 'gen-2',
        title: `Module 2: Applied Methodologies & Practical Workflows`,
        duration: '30 mins',
        type: 'Interactive Walkthrough',
        videoUrl: 'https://www.youtube-nocookie.com/embed/7S_tz1z_5bA',
        desc: `Step-by-step implementation procedures, validation protocols, and technical methods used across ministerial projects.`,
        learningObjectives: [
          'Execute standardized operational protocols with zero error tolerance',
          'Utilize administrative tooling and digital registries',
        ],
      },
      {
        id: 'gen-3',
        title: `Module 3: Real-World Case Study & Anomaly Analysis`,
        duration: '35 mins',
        type: 'Hands-on Practice',
        videoUrl: 'https://www.youtube-nocookie.com/embed/vmEHCJofslg',
        desc: `Case study using live departmental datasets: identify outliers, clean anomalies, and compute key indicators.`,
        learningObjectives: [
          'Resolve ambiguous data entries and perform validation checks',
          'Document findings in structured administrative reporting formats',
        ],
      },
      {
        id: 'gen-4',
        title: `Module 4: Final Competency Check & Certification`,
        duration: '20 mins',
        type: 'Knowledge Assessment',
        videoUrl: 'https://www.youtube-nocookie.com/embed/0oc49DyA3hU',
        desc: `Formative evaluation testing key principles. Passing updates your SkillTwin competency score.`,
      },
    ],
  };
}
