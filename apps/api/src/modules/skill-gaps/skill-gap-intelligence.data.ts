export interface CurriculumTier {
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  title: string;
  duration: string;
  focus: string;
  topics: string[];
  deliverable: string;
}

export interface SkillIntel {
  what: string;
  why: string;
  when: string;
  keyTopics: string[];
  recommendedCurriculumHighlight: string;
  industryStandards: string;
  roadmap?: CurriculumTier[];
}

export const SKILL_INTELLIGENCE: Record<string, SkillIntel> = {
  Python: {
    what: 'Python is the preeminent modern programming language for data analysis, automated ETL pipelines, statistical modeling, and microdata processing. In MoSPI, Python powers large-scale census aggregations, data validation algorithms, and machine learning pipelines.',
    why: 'Official administrative datasets frequently encompass millions of records across states and districts. Manual verification or legacy spreadsheets fail at this scale. Python with libraries such as NumPy, Pandas, and Statsmodels offers vectorized, reproducible calculations, eliminating human error and drastically accelerating publication timelines.',
    when: 'Learn Python when your job role requires handling raw survey microdata, automating monthly/quarterly index calculations (CPI, IIP), cleaning anomalous field records, or performing econometric regressions for government policy planning.',
    keyTopics: [
      'NumPy ndarrays, vectorization, and memory-efficient computation',
      'Pandas DataFrames: indexing, cleaning, missing-data imputation, and reshaping',
      'Grouped aggregations, pivot tables, and multi-index census tabulations',
      'Econometric modeling and hypothesis testing with Statsmodels (OLS, VIF, p-values)',
      'Automated batch ingestion and data pipelines with validation checks',
    ],
    recommendedCurriculumHighlight: 'Master Chapters 1-4 of Python for Data Analysis covering vectorized computation, pandas workflows, and regression models.',
    industryStandards: 'Adheres to MoSPI Reproducible Analytical Pipelines (RAP) and ISO/IEC statistical processing benchmarks.',
    roadmap: [
      {
        level: 'Beginner',
        title: 'Python Syntax, Control Structures & NumPy Fundamentals',
        duration: '2 - 3 Weeks',
        focus: 'Core syntax, variables, conditional logic, loops, functions, lists, dictionaries, and vectorized numerical arrays with NumPy.',
        topics: [
          'Python data types: integers, floats, strings, lists, dicts, tuples, sets',
          'Conditional branching, list comprehensions, and functional map/filter',
          'NumPy 1D and 2D ndarrays: shape, indexing, slicing, and mathematical broadcasting',
          'Vectorized universal functions (ufuncs) avoiding slow python for-loops',
          'File I/O: Reading and writing structured CSV, JSON, and delimited records',
        ],
        deliverable: 'Write an automated script to parse raw enumerator text files and compute summary arrays with zero errors.',
      },
      {
        level: 'Intermediate',
        title: 'Pandas Data Engineering & Survey Microdata Cleaning',
        duration: '3 - 4 Weeks',
        focus: 'Handling real-world tabular data, missing values, outlier detection, grouped aggregations, and multi-table merges.',
        topics: [
          'Pandas Series & DataFrames: .loc, .iloc, query filtering, and boolean masks',
          'Data cleaning: Handling NaN/None via .dropna(), .fillna(), and median imputation',
          'String manipulation, categorical data types, and datetime parsing',
          'Multi-level index aggregations using .groupby() and .agg() with custom metrics',
          'Merging, joining, and concatenating state-wise and district-wise registers',
          'Reshaping data using pd.pivot_table() and pd.melt() for long/wide formats',
        ],
        deliverable: 'Build a reproducible data cleaning pipeline that cleans 100,000+ raw household survey records into validated datasets.',
      },
      {
        level: 'Advanced',
        title: 'Applied Econometrics, Statistical Modeling & Visual Analytics',
        duration: '3 - 4 Weeks',
        focus: 'Fitting statistical regression models, hypothesis tests, diagnostic residuals, and high-impact visual dashboards.',
        topics: [
          'Ordinary Least Squares (OLS) regressions using statsmodels.formula.api',
          'Multicollinearity diagnostics via Variance Inflation Factors (VIF)',
          'Hypothesis testing: two-sample t-tests, Chi-square tests, and ANOVA in SciPy',
          'Diagnostic plotting with Seaborn (distribution plots, pairplots, boxplots)',
          'Interactive geographical choropleth maps using Plotly and GeoPandas',
        ],
        deliverable: 'Generate an executive statistical policy brief containing econometric regression results and interactive visual figures.',
      },
      {
        level: 'Master',
        title: 'Production Pipelines, Big Data Processing & Machine Learning',
        duration: '4 - 6 Weeks',
        focus: 'Architecting enterprise batch pipelines, outlier detection models, reproducible workflows, and automated reporting.',
        topics: [
          'Unsupervised anomaly detection with Isolation Forests and DBSCAN for survey fraud detection',
          'Supervised classification models (Random Forest, XGBoost) for automated code classification',
          'Memory-efficient chunked processing and out-of-core computing with Dask / Polars',
          'Writing unit tests with pytest and reproducible analytical pipelines (RAP)',
          'Packaging CLI tools and Docker containerization for ministerial servers',
        ],
        deliverable: 'Deploy an automated end-to-end data auditing pipeline that scores data quality and flags anomalies in live census streams.',
      },
    ],
  },
  'Statistical Inference': {
    what: 'Statistical Inference is the mathematical discipline of drawing valid, generalizable conclusions about entire populations based on observable sample data, while rigorously accounting for uncertainty and sampling variability.',
    why: 'Government policymakers rely on sample surveys (such as NSSO and PLFS) rather than full censuses to make multi-billion rupee budgetary decisions. Without sound statistical inference, sampling errors and bias could lead to flawed national policies and distorted indicators.',
    when: 'Essential whenever you are designing survey sample sizes, computing standard errors, estimating population totals, testing whether policy interventions produced statistically significant impacts, or writing technical survey reports.',
    keyTopics: [
      'Probability distributions (Normal, Student-t, Binomial, Poisson)',
      'Central Limit Theorem and standard error calculations',
      'Point estimation, unbiasedness, and 95%/99% confidence interval construction',
      'Null hypothesis testing (H0 vs H1), Type I & II errors, and p-value decision rules',
      'Two-sample t-tests, Chi-square tests of independence, and ANOVA',
    ],
    recommendedCurriculumHighlight: 'Covers sampling distributions, interval estimation, and empirical hypothesis testing.',
    industryStandards: 'Conforms to United Nations Statistical Commission (UNSC) standards for national statistical institutes.',
  },
  'Survey Design & Methodology': {
    what: 'Survey Design & Methodology encompasses the end-to-end science of planning, questionnaire design, sampling frame selection, enumerator training, and data collection protocols for large-scale field inquiries.',
    why: 'The validity of any national index depends fundamentally on the quality of data collected at the doorstep. Poor question wording, inadequate interviewer guidelines, or uncalibrated weights introduce non-sampling errors that cannot be corrected downstream.',
    when: 'Crucial when drafting new ministerial survey schedules, conducting pilot pre-tests, selecting household sampling frames, or auditing field enumeration quality in regional offices.',
    keyTopics: [
      'Questionnaire architecture, question sequencing, and cognitive pre-testing',
      'Sampling frame preparation and stratification variables',
      'Field survey logistics, CAPI (Computer-Assisted Personal Interviewing) protocols',
      'Non-sampling error mitigation (response bias, interviewer effects, attrition)',
      'Calibration of design weights and non-response adjustments',
    ],
    recommendedCurriculumHighlight: 'Masterclass covering end-to-end survey architecture and quality assurance.',
    industryStandards: 'Aligned with MoSPI National Sample Survey (NSS) operational manuals and guidelines.',
  },
  'Sampling Theory': {
    what: 'Sampling Theory provides the mathematical formulations and probabilistic principles governing how subsets of a population should be selected to ensure representative, unbiased estimates.',
    why: 'Enumerating entire populations for every metric is logistically impossible and cost-prohibitive. Rigorous sampling theory allows statisticians to achieve 95%+ precision while surveying less than 1% of the target population.',
    when: 'Required when determining minimum sample sizes for nationwide or state-level surveys, designing multi-stage cluster allocations, or evaluating design effects (DEFF).',
    keyTopics: [
      'Simple Random Sampling (SRSWR & SRSWOR) variance formulas',
      'Stratified random sampling: proportional vs Neyman optimum allocation',
      'Systematic sampling and periodic circular sampling',
      'Multi-stage cluster sampling and Primary Sampling Unit (PSU) selection',
      'Estimation of ratios, regression estimators, and design effect (DEFF) metrics',
    ],
    recommendedCurriculumHighlight: 'Deep-dive into stratified and cluster probability sampling architectures.',
    industryStandards: 'Follows Mahalanobis and Sukhatme foundational sampling theorems for official statistical systems.',
  },
  'Data Visualization': {
    what: 'Data Visualization is the practice of translating complex, multidimensional statistical datasets into intuitive visual graphics, dashboards, and geospatial maps that clearly communicate insights to decision-makers.',
    why: 'Policy executives and ministerial secretaries need to grasp national trends in seconds. Well-crafted visual dashboards convert dense tables of numbers into actionable policy decisions while upholding graphical integrity.',
    when: 'Apply when presenting periodic survey releases, building public transparency portals, highlighting district-level disparities, or compiling annual ministerial publications.',
    keyTopics: [
      'Tufte principles of graphical integrity and data-ink ratio',
      'Exploratory distribution plots, boxplots, and multi-faceted charts in Seaborn',
      'Interactive executive dashboards, KPI cards, and cross-filtering in Power BI',
      'Choropleth mapping and thematic geospatial visualization across districts',
      'Design of accessible color palettes and publication-ready SVG/PNG exports',
    ],
    recommendedCurriculumHighlight: 'Learn automated Python plotting and interactive Power BI dashboard construction.',
    industryStandards: 'Complies with MoSPI Public Data Visualization and Accessibility standards.',
  },
  'SQL & Database Management': {
    what: 'Structured Query Language (SQL) and relational database management involve architecting, querying, indexing, and maintaining large relational databases housing administrative records and survey microdata.',
    why: 'Modern government registries (e.g. Udyam, Census, GSTN, MCA) house billions of relational rows. Analysts must write performant, reliable queries that join disparate registries without crashing production database clusters.',
    when: 'Essential when pulling administrative microdata for survey cross-validation, building analytical data marts, performing cohort joins across demographic years, or running aggregate summary queries.',
    keyTopics: [
      'Multi-table relational joins (INNER, LEFT, FULL, CROSS) and set operations',
      'Window functions: ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG/LEAD',
      'Common Table Expressions (CTEs) and recursive queries for hierarchical data',
      'B-Tree indexing, query execution plans, and performance optimization',
      'Data integrity constraints, ACID transactions, and database normalization',
    ],
    recommendedCurriculumHighlight: 'Covers relational modeling, advanced joins, window functions, and database tuning.',
    industryStandards: 'Aligned with National Informatics Centre (NIC) database architectural standards.',
  },
  'Machine Learning': {
    what: 'Machine Learning applies statistical algorithms to discover latent patterns, build predictive models, automate anomaly detection, and classify unstructured text or survey returns without explicit manual programming.',
    why: 'Census and survey verification involves identifying fraudulent enumerations, synthetic responses, and severe anomalies across millions of questionnaires. Machine learning models automate this triage with extreme speed.',
    when: 'Learn ML when deploying automated data quality checks, predictive imputation of non-response entries, clustering economic enterprises, or building economic forecasting models.',
    keyTopics: [
      'Supervised regression and classification algorithms (Random Forest, XGBoost)',
      'Unsupervised clustering (K-Means, DBSCAN) for district typology profiling',
      'Anomaly detection using Isolation Forests for outlier survey flags',
      'Model evaluation: precision, recall, ROC-AUC, cross-validation protocols',
      'Production ML pipelines and model explainability using SHAP values',
    ],
    recommendedCurriculumHighlight: 'Hands-on ML workflows for government data quality and predictive analytics.',
    industryStandards: 'Conforms to NITI Aayog National Strategy for Artificial Intelligence guidelines.',
  },
  'GIS & Spatial Analysis': {
    what: 'Geographic Information Systems (GIS) and Spatial Analysis link geographical coordinates and administrative boundaries with socio-economic microdata to analyze regional patterns and spatial dependencies.',
    why: 'Developmental disparities are fundamentally geographic. A district with high infant mortality or low literacy often borders districts with similar challenges; spatial analytics exposes regional hotspots that aggregate state numbers obscure.',
    when: 'Crucial for census enumeration block delineation, flood or natural disaster vulnerability mapping, regional economic corridor analysis, and spatial autocorrelation studies.',
    keyTopics: [
      'Coordinate Reference Systems (CRS), EPSG projections, shapefiles, and GeoJSON',
      'Spatial joins, point-in-polygon queries, and polygon overlay operations in QGIS',
      'Global Moran I, Local Indicators of Spatial Association (LISA) hotspot tests',
      'Geocoding administrative addresses and census enumeration block mapping',
      'Thematic cartography and interactive web maps for ministerial dissemination',
    ],
    recommendedCurriculumHighlight: 'QGIS spatial joins, boundary overlays, and spatial autocorrelation techniques.',
    industryStandards: 'Aligned with Survey of India (SOI) and National Geospatial Policy standards.',
  },
};

/**
 * Returns structured intelligence for any skill name, with intelligent fallback.
 */
export function getSkillIntelligence(skillName: string, cluster?: string): SkillIntel {
  // Direct match or partial match
  const key = Object.keys(SKILL_INTELLIGENCE).find(
    (k) => k.toLowerCase() === skillName.toLowerCase() || skillName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(skillName.toLowerCase()),
  );

  if (key && SKILL_INTELLIGENCE[key]) {
    const intel = SKILL_INTELLIGENCE[key];
    if (intel.roadmap && intel.roadmap.length > 0) {
      return intel;
    }
    return {
      ...intel,
      roadmap: [
        {
          level: 'Beginner',
          title: `Foundations, Core Concepts & Setup of ${key}`,
          duration: '2 - 3 Weeks',
          focus: `Understand key definitions, administrative directives, and fundamental principles of ${key}.`,
          topics: [
            `Terminology, scope, and operational significance of ${key}`,
            'Official guidelines and compliance requirements',
            'Standard toolsets, interfaces, and baseline calculation methods',
          ],
          deliverable: `Complete baseline certification quiz and initial practical assignment for ${key}.`,
        },
        {
          level: 'Intermediate',
          title: `Applied Procedures & Field Workflows in ${key}`,
          duration: '3 - 4 Weeks',
          focus: `Hands-on execution of standardized departmental workflows with zero error tolerance.`,
          topics: [
            'Step-by-step implementation of verified procedures',
            'Data validation checks, missing entry resolution, and cross-verification',
            'Integration with ministerial registries and reporting databases',
          ],
          deliverable: `Produce an audit-ready departmental case study dataset adhering to official benchmarks.`,
        },
        {
          level: 'Advanced',
          title: `Complex Analysis, Anomaly Detection & Cross-Cadre Integration`,
          duration: '3 - 4 Weeks',
          focus: `Handling edge cases, statistical anomalies, and multi-source data reconciliation.`,
          topics: [
            'Advanced modeling, multivariate cross-tabulations, and regression diagnostics',
            'Root cause analysis of data discrepancies and validation failures',
            'Policy impact assessment and executive presentation synthesis',
          ],
          deliverable: `Formulate a comprehensive statistical analytical paper and executive policy brief.`,
        },
        {
          level: 'Master',
          title: `System Architecture, Audit Oversight & Leadership in ${key}`,
          duration: '4 - 6 Weeks',
          focus: `Leading departmental audits, defining governance standards, and mentoring junior officers.`,
          topics: [
            'Design of national-scale sampling and analytical frameworks',
            'Quality control oversight, bias elimination, and institutional auditing',
            'Continuous modernization and integration of AI-driven validation pipelines',
          ],
          deliverable: `Design and lead a full-scale ministerial evaluation framework from conception to publication.`,
        },
      ],
    };
  }

  // Realistic dynamic generator for any domain skill
  return {
    what: `${skillName} is a core operational competency within ${cluster || 'Technical Cadres'}. It encompasses the standardized methodologies, theoretical principles, and administrative workflows required to execute departmental responsibilities.`,
    why: `Proficiency in ${skillName} ensures operational accuracy, reduces administrative discrepancies, and ensures ministerial projects meet government quality benchmarks and auditing standards.`,
    when: `Focus on mastering ${skillName} when assigned to projects requiring certified expertise, when closing identified competency gaps, or when advancing to senior analyst and supervisory cadres.`,
    keyTopics: [
      `Foundations, regulatory definitions, and core terminology of ${skillName}`,
      'Step-by-step implementation workflows and validation procedures',
      'Standardized documentation, error resolution, and quality audit trails',
      'Real-world case analysis using administrative microdata',
      'Verification protocols and official reporting compliance',
    ],
    recommendedCurriculumHighlight: `Complete the targeted learning path and certification modules covering ${skillName}.`,
    industryStandards: 'Complies with MoSPI quality benchmarks and national administrative frameworks.',
    roadmap: [
      {
        level: 'Beginner',
        title: `Foundations, Core Concepts & Setup of ${skillName}`,
        duration: '2 - 3 Weeks',
        focus: `Understand key definitions, administrative directives, and fundamental principles of ${skillName}.`,
        topics: [
          `Terminology, scope, and operational significance of ${skillName}`,
          'Official guidelines and compliance requirements',
          'Standard toolsets, interfaces, and baseline calculation methods',
        ],
        deliverable: `Complete baseline certification quiz and initial practical assignment for ${skillName}.`,
      },
      {
        level: 'Intermediate',
        title: `Applied Procedures & Field Workflows in ${skillName}`,
        duration: '3 - 4 Weeks',
        focus: `Hands-on execution of standardized departmental workflows with zero error tolerance.`,
        topics: [
          'Step-by-step implementation of verified procedures',
          'Data validation checks, missing entry resolution, and cross-verification',
          'Integration with ministerial registries and reporting databases',
        ],
        deliverable: `Produce an audit-ready departmental case study dataset adhering to official benchmarks.`,
      },
      {
        level: 'Advanced',
        title: `Complex Analysis, Anomaly Detection & Cross-Cadre Integration`,
        duration: '3 - 4 Weeks',
        focus: `Handling edge cases, statistical anomalies, and multi-source data reconciliation.`,
        topics: [
          'Advanced modeling, multivariate cross-tabulations, and regression diagnostics',
          'Root cause analysis of data discrepancies and validation failures',
          'Policy impact assessment and executive presentation synthesis',
        ],
        deliverable: `Formulate a comprehensive statistical analytical paper and executive policy brief.`,
      },
      {
        level: 'Master',
        title: `System Architecture, Audit Oversight & Leadership in ${skillName}`,
        duration: '4 - 6 Weeks',
        focus: `Leading departmental audits, defining governance standards, and mentoring junior officers.`,
        topics: [
          'Design of national-scale sampling and analytical frameworks',
          'Quality control oversight, bias elimination, and institutional auditing',
          'Continuous modernization and integration of AI-driven validation pipelines',
        ],
        deliverable: `Design and lead a full-scale ministerial evaluation framework from conception to publication.`,
      },
    ],
  };
}
