import React, { Component } from "react";
import "./App.scss";
import Nav from "./Nav";
import data from "./ISA.json";
import { Accordion, AccordionItem, Search, Checkbox } from "carbon-components-react";

class App extends Component {

    releases = [ "P1"    , "P2"    , "PPC"   , "v2.00" , "v2.01"  , "v2.02" , "v2.03" , "v2.04"  , "v2.05" , "v2.06" , "v2.07" , "v3.0"  , "v3.0B"  ];
    cores =    [ "POWER1", "POWER2", "PPC970", "POWER4", "POWER4+", "POWER5", ""      , "POWER5+", "POWER6", "POWER7", "POWER8", "POWER9", "future" ];

    constructor() {
        super();
        this.state = {
            data: data,
            releaseSet: this.releases,
            search: ''
        };
    }

    displayRegs(regs) {
        let all = []
        for (let i = 0; i < regs.length; i++) {
            all.push(
                <td className="mnemonic">{regs[i]}</td>
            );
        }
        return(all);
    }

    displayMnemonics(item) {
        let all = [];
        for (let i = 0; i < item.mnemonics.length; i++) {
            all.push(
                <tr>
                <td className="mnemonic">{item.mnemonics[i].mnemonic}</td>
                {this.displayRegs(item.mnemonics[i].regs)}
                </tr>
            );
        }
        return (all);
    }

    displayCode(item) {
        let all = [];
        for (let i = 0; i < item.code.length; i++) {
            all.push(
                <pre className="code">
                {item.code[i]}
                </pre>
            );
        }
        return (all);
    }

    displayBody(item) {
        let all = [];
        for (let i = 0; i < item.body.length; i++) {
            all.push(
                <p>{item.body[i]}</p>
            );
        }
        return (all);
    }

    genItem(item) {
        return (
            <div className="expandContainer">
                    <div className="expandContainer">
                        <div className="column">
                            <h4>Mnemonics:</h4>
                            <table>
                                <tbody>
                                {this.displayMnemonics(item)}
                                </tbody>
                            </table>
                            <h4>Code:</h4>
                            {this.displayCode(item)}
                            {this.displayBody(item)}
                        </div>
                    </div>
            </div>
        );
    }

    genTitle(item) {
        let s = "";
        let comma = '';
        for (let i = 0; i < item.mnemonics.length; i++) {
            s = s + comma + item.mnemonics[i].mnemonic;
            comma = ', ';
        }
        return (
            <table className="item">
                <tbody>
                    <tr>
                        <td className="itemtitledesc">{item.description}</td>
                        <td className="itemtitlemnem">{s}</td>
                    </tr>
                </tbody>
            </table>);
    }

    genData = data => {
        let allJson = [];
        for (let i = 0; i < data.length; i++) {
            for (let m = 0; m < data[i].mnemonics.length; m++) {
                if (data[i].mnemonics[m].mnemonic.startsWith(this.state.search)) {
                    if (this.state.releaseSet.includes(data[i].mnemonics[m].release)) {
                        allJson.push(
                            <AccordionItem
                                title={this.genTitle(data[i])}
                                onClick={e => {
                                    console.log("click");
                                }}
                                onHeadingClick={e => {
                                    console.log("heading click");
                                }}
                            >
                                {this.genItem(data[i])}
                            </AccordionItem>
                        );
                        break;
                    }
                }
            }
        }
        return allJson;
    };

    genReleaseLabel(i) {
        return (
            <table className="releaselabel">
                <tbody>
                    <tr>
                        <td className="releaseversion">{this.releases[i]}</td>
                        <td className="releasecore">{this.cores[i]}</td>
                    </tr>
                </tbody>
            </table>
        );
    }
            
    genReleaseCheckboxes() {
        let all = [];
        for (let i = 0; i < this.releases.length; i++) {
            all.push(
                <Checkbox defaultChecked
                          className="checkbox"
                          id={this.releases[i]}
                          labelText={this.genReleaseLabel(i)}
                          disabled={false}
                          hideLabel={false}
                          wrapperClassName=""
                          onChange={e => {this.filter(e,this.releases[i])}}/>
            );
        }
        return all;
    }

    search() {
        let id = document.getElementById("search-1");
	this.setState({search: id.value});
    }

    filterAll(set) {
        let newSet = [];
	if (set) {
            newSet = this.releases;
        }
        for (let i = 0; i < this.releases.length; i++) {
            let id = document.getElementById(this.releases[i]);
            id.checked = set;
        }
        this.setState({releaseSet: newSet});
    }

    filter(set,b) {
        let newSet = [];
	if (set) {
            newSet = this.state.releaseSet;
            newSet.push(b);
        } else {
            for (let i = 0; i < this.state.releaseSet.length; i++) {
                if (this.state.releaseSet[i] === b)
                    continue;
                newSet.push(this.state.releaseSet[i]);
            }
        }
        this.setState({releaseSet: newSet});
    }

    render() {
        return (
            <div className="App">
                <div
                    data-floating-menu-container="true"
                    role="main"
                    className="pageContainer"
                >
                    <div className="homeContainer">
                        <Nav />
                        <div className="mainContainer">
                            <div className="filterContainer">
                                <h3>Filter stuff here</h3>
                                <fieldset className="checkboxes">
                                    <legend className="filter-heading">Restrict results to ISA levels:</legend>
                                    <Checkbox defaultChecked
                                              className="checkbox"
                                              id="all-releases"
                                              labelText="[all]"
                                              disabled={false}
                                              hideLabel={false}
                                              wrapperClassName=""
                                              onChange={e => {this.filterAll(e)}}/>
                                    {this.genReleaseCheckboxes()}
                                </fieldset>
                            </div>
                            <div className="accordianContainer">
                                <div className="searchContainer">
                                    <Search
                                        className="some-class"
                                        name=""
                                        defaultValue=""
                                        labelText="Search"
                                        closeButtonLabelText=""
                                        placeHolderText="Search"
                                        onChange={() => {
                                            this.search()
                                        }}
                                        id="search-1"
                                    />
                                </div>
                                <Accordion>
                                    {this.genData(this.state.data)}
                                </Accordion>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
