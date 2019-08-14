import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {FormControl, FormGroup} from '@angular/forms';
import {ScenarioNewService} from './scenario-new.service';
import {ScenarioEditService} from '../scenario-detail/scenario-edit.service';
import {ViewDataService} from '../view-data/view-data.service';
import {SettingsTable} from './scenario-new';

const io = ( window as any ).require('socket.io-client');


@Component({
  selector: 'app-scenario-new',
  templateUrl: './scenario-new.component.html',
  styleUrls: ['./scenario-new.component.css']
})


export class ScenarioNewComponent implements OnInit {

  // The final structure we'll iterate over
  scenarioNewStructure: SettingsTable[];

  // If editing scenario, we'll give starting values for settings
  message: string;
  startingValues: StartingValues;

  // For the features
  // TODO: can we consolidate with structure for settings below?
  features: Feature[];
  featureSelectionOption: string[];

  // Temporal settings
  temporalSettingsTable: SettingsTable;

  // Load zone settings
  loadZoneSettingsTable: SettingsTable;

  // System load settings
  systemLoadSettingsTable: SettingsTable;

  // Project capacity settings
  projectCapacitySettingsTable: SettingsTable;

  // Project operational characteristics settings
  projectOperationalCharsSettingsTable: SettingsTable;

  // Fuel settings
  fuelSettingsTable: SettingsTable;

  // Transmission capacity settings
  transmissionCapacitySettingsTable: SettingsTable;

  // Transmission operational characteristics
  transmissionOperationalCharsSettingsTable: SettingsTable;

  // Transission hurdle rates settings
  transmissionHurdleRatesSettingsTable: SettingsTable;

  // Transmission simultaneous flow limits settings
  transmissionSimultaneousFlowLimitsSettingsTable: SettingsTable;

  // Load-following-up settings
  loadFollowingUpSettingsTable: SettingsTable;

  // Load-following-down settings
  loadFollowingDownSettingsTable: SettingsTable;

  // Regulation up settings
  regulationUpSettingsTable: SettingsTable;

  // Regulation down settings
  regulationDownSettingsTable: SettingsTable;

  // Spinning reserves settings
  spinningReservesSettingsTable: SettingsTable;

  // Frequency response settings
  frequencyResponseSettingsTable: SettingsTable;

  // RPS settings
  rpsSettingsTable: SettingsTable;

  // Carbon cap settings
  carbonCapSettingsTable: SettingsTable;

  // PRM settings
  prmSettingsTable: SettingsTable;

  // Local capacity settings
  localCapacitySettingsTable: SettingsTable;

  // Tuning settings
  tuningSettingsTable: SettingsTable;

  // Create the form
  newScenarioForm = new FormGroup({
    scenarioName: new FormControl(),
    scenarioDescription: new FormControl(),
    featureFuels: new FormControl(),
    featureTransmission: new FormControl(),
    featureTransmissionHurdleRates: new FormControl(),
    featureSimFlowLimits: new FormControl(),
    featureLFUp: new FormControl(),
    featureLFDown: new FormControl(),
    featureRegUp: new FormControl(),
    featureRegDown: new FormControl(),
    featureSpin: new FormControl(),
    featureFreqResp: new FormControl(),
    featureRPS: new FormControl(),
    featureCarbonCap: new FormControl(),
    featureTrackCarbonImports: new FormControl(),
    featurePRM: new FormControl(),
    featureELCCSurface: new FormControl(),
    featureLocalCapacity: new FormControl(),
    temporal$temporal: new FormControl(),
    load_zones$load_zones: new FormControl(),
    load_zones$project_load_zones: new FormControl(),
    load_zones$transmission_load_zones: new FormControl(),
    system_load$system_load: new FormControl(),
    project_capacity$portfolio: new FormControl(),
    project_capacity$specified_capacity: new FormControl(),
    project_capacity$specified_fixed_cost: new FormControl(),
    project_capacity$new_cost: new FormControl(),
    project_capacity$new_potential: new FormControl(),
    project_capacity$availability: new FormControl(),
    project_opchar$opchar: new FormControl(),
    fuels$fuels: new FormControl(),
    fuels$fuel_prices: new FormControl(),
    transmission_capacity$portfolio: new FormControl(),
    transmission_capacity$specified_capacity: new FormControl(),
    transmission_opchar$opchar: new FormControl(),
    transmission_hurdle_rates$hurdle_rates: new FormControl(),
    transmission_sim_flow_limits$limits: new FormControl(),
    transmission_sim_flow_limits$groups: new FormControl(),
    load_following_up$bas: new FormControl(),
    load_following_up$req: new FormControl(),
    load_following_up$projects: new FormControl(),
    load_following_down$bas: new FormControl(),
    load_following_down$req: new FormControl(),
    load_following_down$projects: new FormControl(),
    regulation_up$bas: new FormControl(),
    regulation_up$req: new FormControl(),
    regulation_up$projects: new FormControl(),
    regulation_down$bas: new FormControl(),
    regulation_down$req: new FormControl(),
    regulation_down$projects: new FormControl(),
    spinning_reserves$bas: new FormControl(),
    spinning_reserves$req: new FormControl(),
    spinning_reserves$projects: new FormControl(),
    frequency_response$bas: new FormControl(),
    frequency_response$req: new FormControl(),
    frequency_response$projects: new FormControl(),
    rps$bas: new FormControl(),
    rps$req: new FormControl(),
    rps$projects: new FormControl(),
    carbon_cap$bas: new FormControl(),
    carbon_cap$req: new FormControl(),
    carbon_cap$projects: new FormControl(),
    carbon_cap$transmission: new FormControl(),
    prm$bas: new FormControl(),
    prm$req: new FormControl(),
    prm$projects: new FormControl(),
    prm$project_elcc: new FormControl(),
    prm$elcc: new FormControl(),
    prm$energy_only: new FormControl(),
    local_capacity$bas: new FormControl(),
    local_capacity$req: new FormControl(),
    local_capacity$projects: new FormControl(),
    local_capacity$project_chars: new FormControl(),
    tuning$tuning: new FormControl()
    });

  constructor(private scenarioNewService: ScenarioNewService,
              private scenarioEditService: ScenarioEditService,
              private viewDataService: ViewDataService,
              private router: Router,
              private zone: NgZone,
              private location: Location) {
  }

  ngOnInit() {
    // Set the starting form state (if editing or copying a scenario)
    this.setStartingFormState();

    // Get setting subscriptions
    this.scenarioNewStructure = [];
    this.createFeaturesTable();
    this.getTableOptionsTemporal();
    this.getTableOptionsLoadZones();
    this.getTableOptionsLoad();
    this.getTableOptionsProjectCapacity();
    this.getTableOptionsProjectOperationalChars();
    this.getTableOptionsFuels();
    this.getTableOptionsTransmissionCapacity();
    this.getTableOptionsTransmissionOperationalChars();
    this.getTableOptionsTransmissionHurdleRates();
    this.getTableOptionsTransmissionSimultaneousFlowLimits();
    this.getTableOptionsLFReservesUp();
    this.getTableOptionsLFReservesDown();
    this.getTableOptionsRegulationUp();
    this.getTableOptionsRegulationDown();
    this.getTableOptionsSpinningReserves();
    this.getTableOptionsFrequencyResponse();
    this.getTableOptionsRPS();
    this.getTableOptionsCarbonCap();
    this.getTableOptionsPRM();
    this.getTableOptionsLocalCapacity();
    this.getTableOptionsTuning();
  }

  createFeaturesTable(): void {
    this.features = [];
    const featureFuels = new Feature();
    featureFuels.featureName = 'feature_fuels';
    featureFuels.formControlName = 'featureFuels';
    this.features.push(featureFuels);

    const featureTransmission = new Feature();
    featureTransmission.featureName = 'feature_transmission';
    featureTransmission.formControlName = 'featureTransmission';
    this.features.push(featureTransmission);

    const featureTransmissionHurdleRates = new Feature();
    featureTransmissionHurdleRates.featureName =
      'feature_transmission_hurdle_rates';
    featureTransmissionHurdleRates.formControlName =
      'featureTransmissionHurdleRates';
    this.features.push(featureTransmissionHurdleRates);

    const featureSimFlowLimits = new Feature();
    featureSimFlowLimits.featureName = 'feature_simultaneous_flow_limits';
    featureSimFlowLimits.formControlName = 'featureSimFlowLimits';
    this.features.push(featureSimFlowLimits);

    const featureLFUp = new Feature();
    featureLFUp.featureName = 'feature_load_following_up';
    featureLFUp.formControlName = 'featureLFUp';
    this.features.push(featureLFUp);

    const featureLFDown = new Feature();
    featureLFDown.featureName = 'feature_load_following_down';
    featureLFDown.formControlName = 'featureLFDown';
    this.features.push(featureLFDown);

    const featureRegDown = new Feature();
    featureRegDown.featureName = 'feature_regulation_down';
    featureRegDown.formControlName = 'featureRegDown';
    this.features.push(featureRegDown);

    const featureRegUp = new Feature();
    featureRegUp.featureName = 'feature_regulation_up';
    featureRegUp.formControlName = 'featureRegUp';
    this.features.push(featureRegUp);

    const featureSpin = new Feature();
    featureSpin.featureName = 'feature_spinning_reserves';
    featureSpin.formControlName = 'featureSpin';
    this.features.push(featureSpin);

    const featureFreqResp = new Feature();
    featureFreqResp.featureName = 'feature_frequency_response';
    featureFreqResp.formControlName = 'featureFreqResp';
    this.features.push(featureFreqResp);

    const featureRPS = new Feature();
    featureRPS.featureName = 'feature_rps';
    featureRPS.formControlName = 'featureRPS';
    this.features.push(featureRPS);

    const featureCarbonCap = new Feature();
    featureCarbonCap.featureName = 'feature_carbon_cap';
    featureCarbonCap.formControlName = 'featureCarbonCap';
    this.features.push(featureCarbonCap);

    const featureTrackCarbonImports = new Feature();
    featureTrackCarbonImports.featureName = 'feature_track_carbon_imports';
    featureTrackCarbonImports.formControlName = 'featureTrackCarbonImports';
    this.features.push(featureTrackCarbonImports);

    const featurePRM = new Feature();
    featurePRM.featureName = 'feature_prm';
    featurePRM.formControlName = 'featurePRM';
    this.features.push(featurePRM);

    const featureELCCSurface = new Feature();
    featureELCCSurface.featureName = 'feature_elcc_surface';
    featureELCCSurface.formControlName = 'featureELCCSurface';
    this.features.push(featureELCCSurface);

    const featureLocalCapacity = new Feature();
    featureLocalCapacity.featureName = 'feature_local_capacity';
    featureLocalCapacity.formControlName = 'featureLocalCapacity';
    this.features.push(featureLocalCapacity);


    this.featureSelectionOption = featureSelectionOptions();
  }

  getTableOptionsTemporal(): void {
    // Get the settings
    this.scenarioNewService.getTableTemporal()
      .subscribe(
        scenarioSetting => {
          this.temporalSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.temporalSettingsTable);
        }
      );
  }

  getTableOptionsLoadZones(): void {
    // Get the settings
    this.scenarioNewService.getTableLoadZones()
      .subscribe(
        scenarioSetting => {
          this.loadZoneSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.loadZoneSettingsTable);
        }
      );

  }

  getTableOptionsLoad(): void {
    // Get the settings
    this.scenarioNewService.getTableSystemLoad()
      .subscribe(
        scenarioSetting => {
          this.systemLoadSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.systemLoadSettingsTable);
        }
      );
  }

  getTableOptionsProjectCapacity(): void {
    // Get the settings
    this.scenarioNewService.getTableProjectCapacity()
      .subscribe(
        scenarioSetting => {
          this.projectCapacitySettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.projectCapacitySettingsTable);
        }
      );
  }

  getTableOptionsProjectOperationalChars(): void {
    // Get the settings
    this.scenarioNewService.getTableProjectOpChar()
      .subscribe(
        scenarioSetting => {
          this.projectOperationalCharsSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.projectOperationalCharsSettingsTable);
        }
      );
  }

  getTableOptionsFuels(): void {
    // Get the settings
    this.scenarioNewService.getTableFuels()
      .subscribe(
        scenarioSetting => {
          this.fuelSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.fuelSettingsTable);
        }
      );
  }

  getTableOptionsTransmissionCapacity(): void {
    // Get the settings
    this.scenarioNewService.getTableTransmissionCapacity()
      .subscribe(
        scenarioSetting => {
          this.transmissionCapacitySettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.transmissionCapacitySettingsTable);
        }
      );
  }

  getTableOptionsTransmissionOperationalChars(): void {
    // Get the settings
    this.scenarioNewService.getTableTransmissionOpChar()
      .subscribe(
        scenarioSetting => {
          this.transmissionOperationalCharsSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.transmissionOperationalCharsSettingsTable);
        }
      );
  }

  getTableOptionsTransmissionHurdleRates(): void {
    // Get the settings
    this.scenarioNewService.getTableTransmissionHurdleRates()
      .subscribe(
        scenarioSetting => {
          this.transmissionHurdleRatesSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.transmissionHurdleRatesSettingsTable);
        }
      );
  }

  getTableOptionsTransmissionSimultaneousFlowLimits(): void {
    // Get the settings
    this.scenarioNewService.getTableTransmissionSimFlowLimits()
      .subscribe(
        scenarioSetting => {
          this.transmissionSimultaneousFlowLimitsSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.transmissionSimultaneousFlowLimitsSettingsTable);
        }
      );
  }

  getTableOptionsLFReservesUp(): void {
    // Get the settings
    this.scenarioNewService.getTableLFReservesUp()
      .subscribe(
        scenarioSetting => {
          this.loadFollowingUpSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.loadFollowingUpSettingsTable);
        }
      );
  }

  getTableOptionsLFReservesDown(): void {
    // Get the settings
    this.scenarioNewService.getTableLFReservesDown()
      .subscribe(
        scenarioSetting => {
          this.loadFollowingDownSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.loadFollowingDownSettingsTable);
        }
      );
  }

  getTableOptionsRegulationUp(): void {
    // Get the settings
    this.scenarioNewService.getTableRegulationUp()
      .subscribe(
        scenarioSetting => {
          this.regulationUpSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.regulationUpSettingsTable);
        }
      );
  }

  getTableOptionsRegulationDown(): void {
    // Get the settings
    this.scenarioNewService.getTableRegulationDown()
      .subscribe(
        scenarioSetting => {
          this.regulationDownSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.regulationDownSettingsTable);
        }
      );
  }

  getTableOptionsSpinningReserves(): void {
    // Get the settings
    this.scenarioNewService.getTableSpinningReserves()
      .subscribe(
        scenarioSetting => {
          this.spinningReservesSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.spinningReservesSettingsTable);
        }
      );
  }

  getTableOptionsFrequencyResponse(): void {
    // Get the settings
    this.scenarioNewService.getTableFrequencyResponse()
      .subscribe(
        scenarioSetting => {
          this.frequencyResponseSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.frequencyResponseSettingsTable);
        }
      );
  }

  getTableOptionsRPS(): void {
    // Get the settings
    this.scenarioNewService.getTableRPS()
      .subscribe(
        scenarioSetting => {
          this.rpsSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.rpsSettingsTable);
        }
      );
  }

  getTableOptionsCarbonCap(): void {
    // Get the settings
    this.scenarioNewService.getTableCarbonCap()
      .subscribe(
        scenarioSetting => {
          this.carbonCapSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.carbonCapSettingsTable);
        }
      );
  }

  getTableOptionsPRM(): void {
    // Get the settings
    this.scenarioNewService.getTablePRM()
      .subscribe(
        scenarioSetting => {
          this.prmSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.prmSettingsTable);
        }
      );
  }

  getTableOptionsLocalCapacity(): void {
    // Get the settings
    this.scenarioNewService.getTableLocalCapacity()
      .subscribe(
        scenarioSetting => {
          this.localCapacitySettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.localCapacitySettingsTable);
        }
      );
  }

  getTableOptionsTuning(): void {
    // Get the settings
    this.scenarioNewService.getTableTuning()
      .subscribe(
        scenarioSetting => {
          this.tuningSettingsTable = scenarioSetting;
          // Add the table to the scenario structure
          this.scenarioNewStructure.push(this.tuningSettingsTable);
        }
      );
  }

  setStartingFormState(): void {
    this.scenarioEditService.startingValuesSubject
      .subscribe((startingValues: StartingValues) => {
        this.startingValues = startingValues;
        console.log('Setting the scenario initial value');
        this.newScenarioForm.controls.scenarioName.setValue(
          this.startingValues.scenario_name, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureFuels.setValue(
          this.startingValues.feature_fuels, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureTransmission.setValue(
          this.startingValues.feature_transmission, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureTransmissionHurdleRates.setValue(
          this.startingValues.feature_transmission_hurdle_rates, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureSimFlowLimits.setValue(
          this.startingValues.feature_simultaneous_flow_limits, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureLFUp.setValue(
          this.startingValues.feature_load_following_up, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureLFDown.setValue(
          this.startingValues.feature_load_following_down, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureRegUp.setValue(
          this.startingValues.feature_regulation_up, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureRegDown.setValue(
          this.startingValues.feature_regulation_down, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureSpin.setValue(
          this.startingValues.feature_frequency_response, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureFreqResp.setValue(
          this.startingValues.feature_spinning_reserves, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureRPS.setValue(
          this.startingValues.feature_rps, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureCarbonCap.setValue(
          this.startingValues.feature_carbon_cap, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureTrackCarbonImports.setValue(
          this.startingValues.feature_track_carbon_imports, {onlySelf: true}
        );
        this.newScenarioForm.controls.featurePRM.setValue(
          this.startingValues.feature_prm, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureELCCSurface.setValue(
          this.startingValues.feature_elcc_surface, {onlySelf: true}
        );
        this.newScenarioForm.controls.featureLocalCapacity.setValue(
          this.startingValues.feature_local_capacity, {onlySelf: true}
        );
        this.newScenarioForm.controls.temporal$temporal.setValue(
          this.startingValues.temporal, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_zones$load_zones.setValue(
          this.startingValues.geography_load_zones, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_zones$project_load_zones.setValue(
          this.startingValues.project_load_zones, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_zones$transmission_load_zones.setValue(
          this.startingValues.transmission_load_zones, {onlySelf: true}
        );
        this.newScenarioForm.controls.system_load$system_load.setValue(
          this.startingValues.load_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_capacity$portfolio.setValue(
          this.startingValues.project_portfolio, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_capacity$specified_capacity.setValue(
          this.startingValues.project_existing_capacity, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_capacity$specified_fixed_cost.setValue(
          this.startingValues.project_existing_fixed_cost, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_capacity$new_cost.setValue(
          this.startingValues.project_new_cost, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_capacity$new_potential.setValue(
          this.startingValues.project_new_potential, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_capacity$availability.setValue(
          this.startingValues.project_availability, {onlySelf: true}
        );
        this.newScenarioForm.controls.project_opchar$opchar.setValue(
          this.startingValues.project_operating_chars, {onlySelf: true}
        );
        this.newScenarioForm.controls.fuels$fuels.setValue(
          this.startingValues.project_fuels, {onlySelf: true}
        );
        this.newScenarioForm.controls.fuels$fuel_prices.setValue(
          this.startingValues.fuel_prices, {onlySelf: true}
        );
        this.newScenarioForm.controls.transmission_capacity$portfolio.setValue(
          this.startingValues.transmission_portfolio, {onlySelf: true}
        );
        this.newScenarioForm.controls.transmission_capacity$specified_capacity.setValue(
          this.startingValues.transmission_existing_capacity, {onlySelf: true}
        );
        this.newScenarioForm.controls.transmission_opchar$opchar.setValue(
          this.startingValues.transmission_operational_chars, {onlySelf: true}
        );
        this.newScenarioForm.controls.transmission_hurdle_rates$hurdle_rates.setValue(
          this.startingValues.transmission_hurdle_rates, {onlySelf: true}
        );
        this.newScenarioForm.controls.transmission_sim_flow_limits$limits.setValue(
          this.startingValues.transmission_simultaneous_flow_limits, {onlySelf: true}
        );
        this.newScenarioForm.controls.transmission_sim_flow_limits$groups.setValue(
          this.startingValues.transmission_simultaneous_flow_limit_line_groups, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_following_up$bas.setValue(
          this.startingValues.geography_lf_up_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_following_up$req.setValue(
          this.startingValues.load_following_reserves_up_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_following_up$projects.setValue(
          this.startingValues.project_lf_up_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_following_down$bas.setValue(
          this.startingValues.geography_lf_down_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_following_down$req.setValue(
          this.startingValues.load_following_reserves_down_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.load_following_down$projects.setValue(
          this.startingValues.project_lf_down_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.regulation_up$bas.setValue(
          this.startingValues.geography_reg_up_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.regulation_up$req.setValue(
          this.startingValues.regulation_up_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.regulation_up$projects.setValue(
          this.startingValues.project_reg_up_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.regulation_down$bas.setValue(
          this.startingValues.geography_reg_down_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.regulation_down$req.setValue(
          this.startingValues.regulation_down_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.regulation_down$projects.setValue(
          this.startingValues.project_reg_down_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.spinning_reserves$bas.setValue(
          this.startingValues.geography_spin_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.spinning_reserves$req.setValue(
          this.startingValues.spinning_reserves_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.spinning_reserves$projects.setValue(
          this.startingValues.project_spin_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.frequency_response$bas.setValue(
          this.startingValues.geography_freq_resp_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.frequency_response$req.setValue(
          this.startingValues.frequency_response_profile, {onlySelf: true}
        );
        this.newScenarioForm.controls.frequency_response$projects.setValue(
          this.startingValues.project_freq_resp_bas, {onlySelf: true}
        );
        this.newScenarioForm.controls.rps$bas.setValue(
          this.startingValues.geography_rps_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.rps$req.setValue(
          this.startingValues.rps_target, {onlySelf: true}
        );
        this.newScenarioForm.controls.rps$projects.setValue(
          this.startingValues.project_rps_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.carbon_cap$bas.setValue(
          this.startingValues.carbon_cap_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.carbon_cap$req.setValue(
          this.startingValues.carbon_cap, {onlySelf: true}
        );
        this.newScenarioForm.controls.carbon_cap$projects.setValue(
          this.startingValues.project_carbon_cap_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.carbon_cap$transmission.setValue(
          this.startingValues.transmission_carbon_cap_zones, {onlySelf: true}
        );
        this.newScenarioForm.controls.prm$bas.setValue(
          this.startingValues.prm_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.prm$req.setValue(
          this.startingValues.prm_requirement, {onlySelf: true}
        );
        this.newScenarioForm.controls.prm$projects.setValue(
          this.startingValues.project_prm_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.prm$project_elcc.setValue(
          this.startingValues.project_elcc_chars, {onlySelf: true}
        );
        this.newScenarioForm.controls.prm$elcc.setValue(
          this.startingValues.elcc_surface, {onlySelf: true}
        );
        this.newScenarioForm.controls.prm$energy_only.setValue(
          this.startingValues.project_prm_energy_only, {onlySelf: true}
        );
        this.newScenarioForm.controls.local_capacity$bas.setValue(
          this.startingValues.local_capacity_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.local_capacity$req.setValue(
          this.startingValues.local_capacity_requirement, {onlySelf: true}
        );
        this.newScenarioForm.controls.local_capacity$projects.setValue(
          this.startingValues.project_local_capacity_areas, {onlySelf: true}
        );
        this.newScenarioForm.controls.local_capacity$project_chars.setValue(
          this.startingValues.project_local_capacity_chars, {onlySelf: true}
        );
        console.log('Setting the tuning initial value');
        this.newScenarioForm.controls.tuningSetting.setValue(
          this.startingValues.tuning, {onlySelf: true}
        );
          });
  }

  viewData(tableNameInDB, rowNameInDB): void {
    const dataToView = `${tableNameInDB}-${rowNameInDB}`;
    // Send the table name to the view-data service that view-data component
    // uses to determine which tables to show
    this.viewDataService.changeDataToView(dataToView);
    console.log('Sending data to view, ', dataToView);
    // Switch to the new scenario view
    this.router.navigate(['/view-data']);
  }

  saveNewScenario() {
    const socket = io.connect('http://127.0.0.1:8080/');
    socket.on('connect', () => {
        console.log(`Connection established: ${socket.connected}`);
    });
    socket.emit('add_new_scenario', this.newScenarioForm.value);

    socket.on('return_new_scenario_id', (newScenarioID) => {
      console.log('New scenario ID is ', newScenarioID);
      this.zone.run(
        () => {
          this.router.navigate(['/scenario/', newScenarioID]);
        }
      );
    });

    // Change the edit scenario starting values to null when navigating away
    // TODO: set up an event when this happens
    this.scenarioEditService.changeStartingScenario(emptyStartingValues);
  }

  goBack(): void {
    // Change the edit scenario starting values to null when navigating away
    // TODO: set up an event when this happens
    this.scenarioEditService.changeStartingScenario(emptyStartingValues);
    this.location.back();
  }

}


class Feature {
  featureName: string;
  formControlName: string;
}

export class StartingValues {
  // tslint:disable:variable-name
  scenario_id: number;
  scenario_name: string;
  feature_fuels: string;
  feature_transmission: string;
  feature_transmission_hurdle_rates: string;
  feature_simultaneous_flow_limits: string;
  feature_load_following_up: string;
  feature_load_following_down: string;
  feature_regulation_up: string;
  feature_regulation_down: string;
  feature_frequency_response: string;
  feature_spinning_reserves: string;
  feature_rps: string;
  feature_carbon_cap: string;
  feature_track_carbon_imports: string;
  feature_prm: string;
  feature_elcc_surface: string;
  feature_local_capacity: string;
  temporal: string;
  geography_load_zones: string;
  geography_lf_up_bas: string;
  geography_lf_down_bas: string;
  geography_reg_up_bas: string;
  geography_reg_down_bas: string;
  geography_spin_bas: string;
  geography_freq_resp_bas: string;
  geography_rps_areas: string;
  carbon_cap_areas: string;
  prm_areas: string;
  local_capacity_areas: string;
  project_portfolio: string;
  project_operating_chars: string;
  project_availability: string;
  project_fuels: string;
  fuel_prices: string;
  project_load_zones: string;
  project_lf_up_bas: string;
  project_lf_down_bas: string;
  project_reg_up_bas: string;
  project_reg_down_bas: string;
  project_spin_bas: string;
  project_freq_resp_bas: string;
  project_rps_areas: string;
  project_carbon_cap_areas: string;
  project_prm_areas: string;
  project_elcc_chars: string;
  project_prm_energy_only: string;
  project_local_capacity_areas: string;
  project_local_capacity_chars: string;
  project_existing_capacity: string;
  project_existing_fixed_cost: string;
  project_new_cost: string;
  project_new_potential: string;
  transmission_portfolio: string;
  transmission_load_zones: string;
  transmission_existing_capacity: string;
  transmission_operational_chars: string;
  transmission_hurdle_rates: string;
  transmission_carbon_cap_zones: string;
  transmission_simultaneous_flow_limits: string;
  transmission_simultaneous_flow_limit_line_groups: string;
  load_profile: string;
  load_following_reserves_up_profile: string;
  load_following_reserves_down_profile: string;
  regulation_up_profile: string;
  regulation_down_profile: string;
  spinning_reserves_profile: string;
  frequency_response_profile: string;
  rps_target: string;
  carbon_cap: string;
  prm_requirement: string;
  elcc_surface: string;
  local_capacity_requirement: string;
  tuning: string;
}


function featureSelectionOptions() {
    return ['', 'yes', 'no'];
  }


// TODO: need to set on navigation away from this page, not just button clicks
export const emptyStartingValues = {
  // tslint:disable:variable-name
  scenario_id: null,
  scenario_name: null,
  feature_fuels: null,
  feature_transmission: null,
  feature_transmission_hurdle_rates: null,
  feature_simultaneous_flow_limits: null,
  feature_load_following_up: null,
  feature_load_following_down: null,
  feature_regulation_up: null,
  feature_regulation_down: null,
  feature_frequency_response: null,
  feature_spinning_reserves: null,
  feature_rps: null,
  feature_carbon_cap: null,
  feature_track_carbon_imports: null,
  feature_prm: null,
  feature_elcc_surface: null,
  feature_local_capacity: null,
  temporal: null,
  geography_load_zones: null,
  geography_lf_up_bas: null,
  geography_lf_down_bas: null,
  geography_reg_up_bas: null,
  geography_reg_down_bas: null,
  geography_spin_bas: null,
  geography_freq_resp_bas: null,
  geography_rps_areas: null,
  carbon_cap_areas: null,
  prm_areas: null,
  local_capacity_areas: null,
  project_portfolio: null,
  project_operating_chars: null,
  project_availability: null,
  project_fuels: null,
  fuel_prices: null,
  project_load_zones: null,
  project_lf_up_bas: null,
  project_lf_down_bas: null,
  project_reg_up_bas: null,
  project_reg_down_bas: null,
  project_spin_bas: null,
  project_freq_resp_bas: null,
  project_rps_areas: null,
  project_carbon_cap_areas: null,
  project_prm_areas: null,
  project_elcc_chars: null,
  project_prm_energy_only: null,
  project_local_capacity_areas: null,
  project_local_capacity_chars: null,
  project_existing_capacity: null,
  project_existing_fixed_cost: null,
  project_new_cost: null,
  project_new_potential: null,
  transmission_portfolio: null,
  transmission_load_zones: null,
  transmission_existing_capacity: null,
  transmission_operational_chars: null,
  transmission_hurdle_rates: null,
  transmission_carbon_cap_zones: null,
  transmission_simultaneous_flow_limits: null,
  transmission_simultaneous_flow_limit_line_groups: null,
  load_profile: null,
  load_following_reserves_up_profile: null,
  load_following_reserves_down_profile: null,
  regulation_up_profile: null,
  regulation_down_profile: null,
  spinning_reserves_profile: null,
  frequency_response_profile: null,
  rps_target: null,
  carbon_cap: null,
  prm_requirement: null,
  elcc_surface: null,
  local_capacity_requirement: null,
  tuning: null
};
