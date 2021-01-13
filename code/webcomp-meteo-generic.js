import "@babel/polyfill";
import { html } from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { request__get_coordinates_from_search } from "./api/hereMaps";
import { BaseMeteoGeneric } from "./baseClass";
import { render_details } from "./components/details";
import { render__mapControls } from "./components/mapControls";
import { render_searchPlaces } from "./components/searchPlaces";
import "./components/tabByArea/tabByArea";
import "./components/tabForecast/tabForecast";
import "./components/tabOnTheMountain/tabOnTheMountain";
import { render__tabVideo } from "./components/tabVideo";
import {
  drawStationsOnMap,
  drawUserOnMap,
  initializeMap,
} from "./mainClassMethods/map";
import "./shared_components/button/button";
import "./shared_components/dropdown/dropdown";
import "./shared_components/languagePicker/languagePicker";
// Shared components
import "./shared_components/searchBar/searchBar";
import "./shared_components/sideModalHeader/sideModalHeader";
import "./shared_components/sideModalRow/sideModalRow";
import "./shared_components/sideModalTabs/sideModalTabs";
import "./shared_components/tag/tag";
import { t } from "./translations";
import { debounce, isMobile, LANGUAGES } from "./utils";

export const CUSTOMstationCompetenceTypes = {
  tourism: "tourism",
  mobility: "mobility",
};

class MeteoGeneric extends BaseMeteoGeneric {
  async drawMap() {
    drawUserOnMap.bind(this)();
  }

  async firstUpdated() {
    if (this.currentTab === 1) {
      initializeMap.bind(this)();
      drawUserOnMap.bind(this)();
      await drawStationsOnMap.bind(this)();
    }
    this.isLoading = false;
  }

  handleChangeTab(id) {
    this.currentTab = id;
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "currentTab") {
        if (oldValue === 1) {
          this.map.off();
          this.map.remove();
        }
        if (this.currentTab === 1 && oldValue !== undefined) {
          this.isLoading = true;
          initializeMap
            .bind(this)()
            .then(() => {
              drawUserOnMap.bind(this)();
              drawStationsOnMap
                .bind(this)()
                .then(() => {
                  this.isLoading = false;
                });
            });
        }
      }
    });
  }

  handleSearch = (searchValue) => {
    console.log(searchValue);
  };

  handleSearchBarFilterAction = () => {
    console.log("Toggle filters");
    this.showFilters = !this.showFilters;
  };

  debounced__request__get_coordinates_from_search = debounce(
    500,
    request__get_coordinates_from_search.bind(this)
  );

  render() {
    let isSmallWidth = false;
    if (this.width.includes("px")) {
      isSmallWidth = parseInt(this.width.replace("px")) <= 350;
    }
    let isSmallHeight = false;
    if (this.height.includes("px")) {
      isSmallHeight = parseInt(this.height.replace("px")) <= 350;
    }

    return html`
      <style>
        * {
          --width: ${this.width};
          --height: ${this.height};
          --w-c-font-family: ${this.fontFamily};
        }
      </style>
      ${this.tiles_url
        ? ""
        : html`
            <p style="color:red">Required attribute \`tiles_url\` is missing</p>
          `}

      <div
        class=${classMap({
          meteo_generic: true,
          mobile: this.isMobile,
        })}
      >
        ${this.isLoading ? html`<div class="globalOverlay"></div>` : ""}
        <div
          class=${classMap({
            meteo_generic__language_picker: true,
            big_margin: this.isMobile || isSmallWidth,
            isSmallHeight: isSmallHeight,
          })}
        >
          <wc-languagepicker
            .supportedLanguages="${LANGUAGES}"
            .language="${this.language}"
            .changeLanguageAction="${(language) => {
              this.language = language;
            }}"
          ></wc-languagepicker>
        </div>

        <div
          class=${classMap({
            meteo_generic__sideBar: true,
            isSmallWidth: isSmallWidth,
          })}
        >
          <div class="meteo_generic__sideBar__tabBar">
            <wc-sidemodal-tabs
              .action="${(id) => {
                this.detailsOpen = false;
                this.currentTab = id;
              }}"
              .idSelected="${this.currentTab}"
              .elements="${[
                { label: t.map[this.language], id: 1 },
                { label: t.forecasts[this.language], id: 2 },
                { label: t.video[this.language], id: 3 },
                { label: t.inTheMountains[this.language], id: 4 },
                { label: t.byArea[this.language], id: 5 },
              ]}"
            ></wc-sidemodal-tabs>
          </div>
          ${this.currentTab === 1
            ? html`<div class="meteo_generic__sideBar__searchBar mt-4px">
                ${render_searchPlaces.bind(this)()}
              </div>`
            : ""}
          ${this.detailsOpen
            ? html`<div
                class=${classMap({
                  meteo_generic__sideBar__details: true,
                  "mt-4px": true,
                  isSmallWidth: isSmallWidth,
                  isSmallHeight: isSmallHeight,
                })}
              >
                ${render_details.bind(this)()}
              </div>`
            : ""}
        </div>
        ${this.currentTab === 1
          ? html`
              <div id="map"></div>
              ${render__mapControls.bind(this)()}
            `
          : ""}
        ${this.currentTab === 2
          ? html`<weather-forecast-widget
              .forecast_days="4"
              .selected_district_id="1"
              .language_translation="${this.language}"
              .height="${this.height}"
              .width="${this.width}"
            ></weather-forecast-widget>`
          : ""}
        ${this.currentTab === 3 ? render__tabVideo.bind(this)() : ""}
        ${this.currentTab === 4
          ? html`<meteo-mountain-widget
              .language_translation="${this.language}"
              .height="${this.height}"
              .width="${this.width}"
            ></meteo-mountain-widget>`
          : ""}
        ${this.currentTab === 5
          ? html`<weather-forecast-byarea
              .forecast_days="4"
              .selected_district_id="1"
              .language_translation="${this.language}"
              .height="${this.height}"
              .width="${this.width}"
            ></weather-forecast-byarea>`
          : ""}
      </div>
    `;
  }
}

customElements.get("webcomp-meteo-generic") ||
  customElements.define("webcomp-meteo-generic", MeteoGeneric);
