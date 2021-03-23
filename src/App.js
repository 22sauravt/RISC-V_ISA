import React, { Component } from "react";
import "./App.scss";
import Nav from "./Nav";
import ISA from "./ISA.json";
import {
    Accordion,
    AccordionItem,
    Search,
    Checkbox,
    CodeSnippet,
    Link,
    StructuredListWrapper, StructuredListBody, StructuredListRow, StructuredListCell,
    DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell
} from "carbon-components-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const releases = [
    "P1",
    "P2",
    "PPC",
    "v2.00",
    "v2.01",
    "v2.02",
    "v2.03",
    "v2.04",
    "v2.05",
    "v2.06",
    "v2.07",
    "v3.0",
    "v3.0B",
    "v3.1"
];

const cores = [
    "POWER1",
    "POWER2",
    "PPC970",
    "POWER4",
    "POWER4+",
    "POWER5",
    "",
    "POWER5+",
    "POWER6",
    "POWER7",
    "POWER8",
    "",
    "POWER9",
    "POWER10"
];

var classes = [];
var forms = [];
var books = [];

function genClassList(tree,index,array) {
    classes.push(tree.name);
    tree.chapters.forEach(genClassList);
}

function genFormList(tree,index,array) {
    forms.push(tree);
}

function genBookList(tree,index,array) {
    books.push(tree.shortname);
}

class App extends Component {

    constructor(props) {
        super(props);
        /* Is the constructor called twice?? */
        if (classes.length == 0)
            ISA.chapters.forEach(genClassList);
        if (forms.length == 0)
            ISA.forms.forEach(genFormList);
        if (books.length == 0)
            ISA.books.forEach(genBookList);
        this.state = {
            data: ISA.instructions,
            intrinsics: ISA.intrinsics,
            releaseSet: releases,
            classSet: classes,
            formSet: forms,
            bookSet: books,
            search: "",
            search_mnemonics: true,
            search_names: false,
            search_intrinsics: false
        };
    }

    displayOperands(operands) {
        let all = "";
        let comma = "";
        for (let i = 0; i < operands.length; i++) {
            all += comma + operands[i];
            comma = ",";
        }
        return all;
    }

    displayMnemonics(item) {
        let all = [];
        const spaces = "               ";

        for (let i = 0; i < item.mnemonics.length; i++) {
            let gap = spaces.length - item.mnemonics[i].mnemonic.length;
            if (gap < 2) gap = 2;
            let s =
                item.mnemonics[i].mnemonic +
                spaces.substr(0,gap) +
                this.displayOperands(item.mnemonics[i].operands);
            let conditions = "";
            try {
                if (item.mnemonics[i].conditions.length > 0) {
                    conditions = "(";
                    let comma = "";
                    for (let c = 0; c < item.mnemonics[i].conditions.length; c++) {
                        conditions += comma + item.mnemonics[i].conditions[c].field + "=" + item.mnemonics[i].conditions[c].value;
                        comma = ", ";
                    }
                    conditions += ")";
                }
            } catch(err) {}
            let key = "mnemonics-table-" + i.toString();
            all.push(
                <table key={key}>
                    <tbody>
                        <tr>
                            <td>
                                <CopyToClipboard text={s}>
                                    <CodeSnippet
                                        className="syntax"
                                        key="syntax"
                                        feedback="Copied to clipboard"
                                        copyButtonDescription="Copy"
                                        ariaLabel="mnemonic"
                                        type="inline"
                                    >
                                        {s}
                                    </CodeSnippet>
                                </CopyToClipboard>
                            </td>
                            <td>
                                <p className="conditions">{conditions}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }
        return all;
    }

    displayCode(item) {
        let s = "";
        let newline = "";
        for (let i = 0; i < item.code.length; i++) {
            s += newline + item.code[i];
            newline = "\n";
        }
        return s;
    }

    displayBody(item) {
        let all = [];
        for (let i = 0; i < item.body.length; i++) {
            all.push(<p key={i} dangerouslySetInnerHTML={{__html: item.body[i]}}/>);
        }
        return all;
    }

    displayField(layout,key) {
        let all = [];
        var d = layout.name;
        if (d.includes("opcode")) {
            d = d.replace("opcode",layout.value);
        }
        all.push(<td className="instruction-field" key={key} colSpan={layout.size}>{d}</td>);
        return all;
    }

    displayFields(layout) {
        let all = [];
        for (let i = 0; i < layout.length; i++) {
            all.push(this.displayField(layout[i],i));
        }
        return all;
    }

    displayBitScale(layout) {
        let all = [];
        for (let i = 0; i < 32; i++) {
            all.push(<td className="instruction-bit-number" key={i}>{("0" + i.toString()).slice(-2)}</td>);
        }
        return all;
    }

    displayLayoutRows(layout) {
        let all = [];
        let bits = 0;
        let start = 0;
        for (let i = 0; i < layout.length; i++) {
            bits += parseInt(layout[i].size);
            if (bits >= 32) {
                all.push(<tr key={start}>{this.displayFields(layout.slice(start,i+1))}</tr>);
                start = i+1;
                bits = 0;
            }
        }
        return all;
    }

    displayLayout(layout) {
	let all = [];
        all.push(this.displayLayoutRows(layout));
        all.push(<tr key="bitScale">{this.displayBitScale(layout)}</tr>);
        return (all);
    }

    displayAssociatedIntrinsics(item) {
        let all = [];
        if (item.intrinsics.length) {
            all.push(<p key={item.description}>Associated Intrinsics:</p>);
            let comma = "";
            for (let i = 0; i < item.intrinsics.length; i++) {
                all.push(comma);
                all.push(
                    <Link
                        className="link"
                        key={item.intrinsics[i]}
                        href="#"
                        onClick={e => { this.setState({ search: item.intrinsics[i], search_intrinsics: true }); }}
                    >
                        {item.intrinsics[i]}
                    </Link>
                );
                comma = ", ";
            }
        }
        return all;
    }

    genItem(item) {
        return (
            <div className="expandContainer">
                <div className="column">
                    {this.displayMnemonics(item)}
                    <br />
                    <table style={{width: '100%'}}>
                        <tbody>
                            <tr>
                                <td>
                                    <table className="instruction-layout">
                                        <tbody>
                                            {this.displayLayout(item.layout)}
                                        </tbody>
                                    </table>
                                </td>
                                <td style={{textAlign: 'right'}}>{item.form}</td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <CopyToClipboard text={this.displayCode(item)}>
                        <CodeSnippet
                            className="pseudocode"
                            key="pseudocode"
                            type="multi"
                            feedback="Copied to clipboard"
                        >
                            <p className="inner" dangerouslySetInnerHTML={{__html: this.displayCode(item)}}/>
                        </CodeSnippet>
                    </CopyToClipboard>
                    <br />
                    <div className="prose">
                        {this.displayBody(item)}
                    </div>
                    <br />
                    <div className="intrinsics">
                        {this.displayAssociatedIntrinsics(item)}
                    </div>
                </div>
            </div>
        );
    }

    genTitle(item) {
        let s = "";
        let comma = "";
        for (let i = 0; i < item.mnemonics.length; i++) {
            s = s + comma + item.mnemonics[i].mnemonic;
            comma = ", ";
        }
        let v = "";
        comma = "";
        for (let i = 0; i < item.mnemonics.length; i++) {
            let match = false;
            for (let j = i+1; j < item.mnemonics.length; j++) {
                if (item.mnemonics[i].release == item.mnemonics[j].release) {
                    match = true;
                    break;
                }
            }
            if (!match) {
                v += comma + item.mnemonics[i].release;
                comma = ", ";
            }
        }
        return (
            <table className="item">
                <tbody>
                    <tr>
                        <td className="itemtitledesc">{item.description}</td>
                        <td className="itemtitlemnem">{s}</td>
                        <td className="itemtitleISA">{v}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    matchEach(value) {
        return this.includes(value);
    }

    genData = data => {
        let allJson = [];
        for (let i = 0; i < data.length; i++) {
            for (let m = 0; m < data[i].mnemonics.length; m++) {
                if (
                    (this.state.search_mnemonics &&
                     data[i].mnemonics[m].mnemonic.startsWith(this.state.search)) ||
                    (this.state.search_names &&
                     this.state.search.split(" ").every(this.matchEach,data[i].description.toLowerCase()))
                ) {
                    if (
                        this.state.releaseSet.includes(
                            data[i].mnemonics[m].release
                        ) &&
                        this.state.classSet.includes(
                            data[i].category
                        ) &&
                        this.state.formSet.includes(
                            data[i].form
                        ) &&
                        this.state.bookSet.includes(
                            data[i].book
                        )
                    ) {
                        allJson.push(
                            <AccordionItem
                                title={this.genTitle(data[i])}
                                key={data[i].mnemonics[0].mnemonic + data[i].book}
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
                        <td className="releaseversion">{releases[i]}</td>
                        <td className="releasecore">{cores[i]}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    genReleaseCheckboxes() {
        let all = [];
        for (let i = 0; i < releases.length; i++) {
            all.push(
                <Checkbox
                    defaultChecked
                    className="checkbox"
                    id={releases[i]}
                    key={releases[i]}
                    labelText={this.genReleaseLabel(i)}
                    disabled={false}
                    hideLabel={false}
                    wrapperClassName=""
                    onChange={e => {
                        this.filterByReleases(e, releases[i]);
                    }}
                />
            );
        }
        return all;
    }

    genClassCheckboxes(chapters) {
        let all = [];
        for (let i = 0; i < chapters.length; i++) {
            all.push(
                <Checkbox
                    defaultChecked
                    className="checkbox"
                    id={chapters[i].name}
                    key={chapters[i].name}
                    labelText={chapters[i].name}
                    disabled={false}
                    hideLabel={false}
                    wrapperClassName=""
                    onChange={e => {
                        this.filterByClasses(e, chapters[i].name);
                    }}
                />
            );
        }
        return all;
    }

    genBookCheckboxes(books) {
        let all = [];
        for (let i = 0; i < books.length; i++) {
            all.push(
                <Checkbox
                    defaultChecked
                    className="checkbox"
                    id={books[i].shortname}
                    key={books[i].shortname}
                    labelText={books[i].title}
                    disabled={false}
                    hideLabel={false}
                    wrapperClassName=""
                    onChange={e => {
                        this.filterByBooks(e, books[i].shortname);
                    }}
                />
            );
        }
        return all;
    }

    genFormCheckboxes(forms) {
        let all = [];
        for (let i = 0; i < forms.length; i++) {
            all.push(
                <Checkbox
                    defaultChecked
                    className="checkbox"
                    id={forms[i]}
                    key={forms[i]}
                    labelText={forms[i]}
                    disabled={false}
                    hideLabel={false}
                    wrapperClassName=""
                    onChange={e => {
                        this.filterByForms(e, forms[i]);
                    }}
                />
            );
        }
        return all;
    }

    search() {
        let id = document.getElementById("search-1");
        this.setState({ search: id.value.toLowerCase() });
    }

    filterAllReleases(set) {
        let newSet = [];
        if (set) {
            newSet = releases;
        }
        for (let i = 0; i < releases.length; i++) {
            let id = document.getElementById(releases[i]);
            id.checked = set;
        }
        this.setState({ releaseSet: newSet });
    }

    filterAllClasses(set) {
        let newSet = [];
        if (set) {
            newSet = classes;
        }
        for (let i = 0; i < classes.length; i++) {
            let id = document.getElementById(classes[i]);
            id.checked = set;
        }
        this.setState({ classSet: newSet });
    }

    filterAllForms(set) {
        let newSet = [];
        if (set) {
            newSet = forms;
        }
        for (let i = 0; i < forms.length; i++) {
            let id = document.getElementById(forms[i]);
            id.checked = set;
        }
        this.setState({ formSet: newSet });
    }

    filterAllBooks(set) {
        let newSet = [];
        if (set) {
            newSet = books;
        }
        for (let i = 0; i < books.length; i++) {
            let id = document.getElementById(books[i]);
            id.checked = set;
        }
        this.setState({ bookSet: newSet });
    }

    filterByReleases(set, b) {
        let newSet = [];
        if (set) {
            newSet = this.state.releaseSet;
            newSet.push(b);
        } else {
            for (let i = 0; i < this.state.releaseSet.length; i++) {
                if (this.state.releaseSet[i] === b) continue;
                newSet.push(this.state.releaseSet[i]);
            }
        }
        this.setState({ releaseSet: newSet });
    }

    filterByClasses(set, b) {
        let newSet = [];
        if (set) {
            newSet = this.state.classSet;
            newSet.push(b);
        } else {
            for (let i = 0; i < this.state.classSet.length; i++) {
                if (this.state.classSet[i] === b) continue;
                newSet.push(this.state.classSet[i]);
            }
        }
        this.setState({ classSet: newSet });
    }

    filterByBooks(set, b) {
        console.log("filterByBooks(" + b + ")")
        let newSet = [];
        if (set) {
            newSet = this.state.bookSet;
            newSet.push(b);
        } else {
            for (let i = 0; i < this.state.bookSet.length; i++) {
                console.log(this.state.bookSet[i] + "==" + b);
                if (this.state.bookSet[i] === b) continue;
                newSet.push(this.state.bookSet[i]);
            }
        }
        console.log(newSet)
        this.setState({ bookSet: newSet });
    }

    filterByForms(set, b) {
        let newSet = [];
        if (set) {
            newSet = this.state.formSet;
            newSet.push(b);
        } else {
            for (let i = 0; i < this.state.formSet.length; i++) {
                if (this.state.formSet[i] === b) continue;
                newSet.push(this.state.formSet[i]);
            }
        }
        this.setState({ formSet: newSet });
    }

    displayAssociatedInstructions(item) {
        let all = [];
        if (item.instructions.length) {
            let comma = "";
            for (let i = 0; i < item.instructions.length; i++) {
                all.push(comma);
                all.push(
                    <Link
                        className="link"
                        key={item.instructions[i]}
                        href="#"
                        onClick={e => { this.setState({ search: item.instructions[i], search_instructions: true }); }}
                    >
                        {item.instructions[i]}
                    </Link>
                );
                comma = ", ";
            }
        }
        return all;
    }

    genMultiLine(row,string) {
        let all = [];
        try {
          string.split("\n").map ((line) => (
            all.push(line),
            all.push(<br/>)
          ))
        }
        catch (err) {}
        return all;
    }

    genIntrinsic(item) {
        return (
            <div className="column">
                <CopyToClipboard text={item.syntax}>
                    <CodeSnippet
                        className="syntax"
                        key="syntax"
                        feedback="Copied to clipboard"
                        copyButtonDescription="Copy"
                        ariaLabel="syntax"
                        type="single"
                    >
                        {item.syntax}
                    </CodeSnippet>
                </CopyToClipboard>
                <br />
                <StructuredListWrapper>
                    <StructuredListBody>
                        <StructuredListRow>
                            <StructuredListCell head>
                                Purpose:
                            </StructuredListCell>
                            <StructuredListCell>
                                {item.purpose}
                            </StructuredListCell>
                        </StructuredListRow>
                        <StructuredListRow>
                            <StructuredListCell head>
                                Result:
                            </StructuredListCell>
                            <StructuredListCell>
                                {item.result}
                            </StructuredListCell>
                        </StructuredListRow>
                        <StructuredListRow>
                            <StructuredListCell head>
                                Endianness:
                            </StructuredListCell>
                            <StructuredListCell>
                                {item.endianness}
                            </StructuredListCell>
                        </StructuredListRow>
                        <StructuredListRow>
                            <StructuredListCell head>
                                Type signatures:
                            </StructuredListCell>
                            <StructuredListCell>
                                <DataTable headers={item.type_signatures.var_heads} rows={item.type_signatures.list}>
                                    {({ headers, rows }) => (
                                        <TableContainer>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        {headers.map((header) => (
                                                            <TableHeader>
                                                                {header.header}
                                                            </TableHeader>
                                                        ))}
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {rows.map((row) => (
                                                        <TableRow key={row.id}>
                                                            {row.cells.map((cell) => (
                                                                <TableCell key={cell.id} className="type-sig-entry">{this.genMultiLine(row,cell.value)}</TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </DataTable>
                            </StructuredListCell>
                        </StructuredListRow>
                        <StructuredListRow>
                            <StructuredListCell head>
                                Associated instructions:
                            </StructuredListCell>
                            <StructuredListCell>
                                <div className="intrinsics">
                                    {this.displayAssociatedInstructions(item)}
                                </div>
                            </StructuredListCell>
                        </StructuredListRow>
                    </StructuredListBody>
                </StructuredListWrapper>
            </div>
        );
    }

    genIntrinsicTitle (item) {
        return (
            <table className="item">
                <tbody>
                    <tr>
                        <td className="itemtitledesc">{item.name}</td>
                        <td className="itemtitlemnem">{item.mnemonic}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    genIntrinsics = data => {
        let allJson = [];
        if (this.state.search_intrinsics) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].mnemonic.startsWith(this.state.search)) {
                        allJson.push(
                            <AccordionItem
                                title={this.genIntrinsicTitle (data[i])}
                                key={data[i].mnemonic}
                                onClick={e => {
                                    console.log("click");
                                }}
                                onHeadingClick={e => {
                                    console.log("heading click");
                                }}
                            >
                                {this.genIntrinsic(data[i])}
                            </AccordionItem>
                        );
                }
            }
        }
        return allJson;
    };

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
                                <Accordion>
                                    <AccordionItem
                                        title="ISA levels"
                                    >
                                        <fieldset className="checkboxes">
                                            <Checkbox
                                                defaultChecked
                                                className="checkbox"
                                                id="all-releases"
                                                labelText="[all]"
                                                disabled={false}
                                                hideLabel={false}
                                                wrapperClassName=""
                                                onChange={e => {
                                                    this.filterAllReleases(e);
                                                }}
                                            />
                                            {this.genReleaseCheckboxes()}
                                        </fieldset>
                                    </AccordionItem>
                                </Accordion>
                                <Accordion>
                                    <AccordionItem
                                        title="Instruction classes"
                                    >
                                        <fieldset className="checkboxes">
                                            <Checkbox
                                                defaultChecked
                                                className="checkbox"
                                                id="all-classes"
                                                labelText="[all]"
                                                disabled={false}
                                                hideLabel={false}
                                                wrapperClassName=""
                                                onChange={e => {
                                                    this.filterAllClasses(e);
                                                }}
                                            />
                                            {this.genClassCheckboxes(ISA.chapters)}
                                        </fieldset>
                                    </AccordionItem>
                                </Accordion>
                                <Accordion>
                                    <AccordionItem
                                        title="Instruction forms"
                                    >
                                        <fieldset className="checkboxes">
                                            <Checkbox
                                                defaultChecked
                                                className="checkbox"
                                                id="all-forms"
                                                labelText="[all]"
                                                disabled={false}
                                                hideLabel={false}
                                                wrapperClassName=""
                                                onChange={e => {
                                                    this.filterAllForms(e);
                                                }}
                                            />
                                            {this.genFormCheckboxes(ISA.forms)}
                                        </fieldset>
                                    </AccordionItem>
                                </Accordion>
                                <Accordion>
                                    <AccordionItem
                                        title="Books"
                                    >
                                        <fieldset className="checkboxes">
                                            <Checkbox
                                                defaultChecked
                                                className="checkbox"
                                                id="all-books"
                                                labelText="[all]"
                                                disabled={false}
                                                hideLabel={false}
                                                wrapperClassName=""
                                                onChange={e => {
                                                    this.filterAllBooks(e);
                                                }}
                                            />
                                            {this.genBookCheckboxes(ISA.books)}
                                        </fieldset>
                                    </AccordionItem>
                                </Accordion>
                            </div>
                            <div className="accordianContainer">
                                <div className="searchContainer">
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td style={{justifyContent: 'center'}}>
                                                    <Search
                                                        className="some-class"
                                                        name=""
                                                        defaultValue=""
                                                        labelText="Search"
                                                        closeButtonLabelText=""
                                                        placeHolderText="Search"
                                                        onChange={() => {
                                                            this.search();
                                                        }}
                                                        id="search-1"
                                                    />
                                                </td>
                                                <td>
                                                    <Checkbox
                                                        defaultChecked
                                                        className="checkbox"
                                                        id="search-mnemonics"
                                                        labelText="mnemonics"
                                                        disabled={false}
                                                        hideLabel={false}
                                                        wrapperClassName=""
                                                        onChange={e => {
                                                            this.setState({ search_mnemonics: e });
                                                        }}
                                                    />
                                                    <Checkbox
                                                        className="checkbox"
                                                        id="search-names"
                                                        labelText="names"
                                                        disabled={false}
                                                        hideLabel={false}
                                                        wrapperClassName=""
                                                        onChange={e => {
                                                            this.setState({ search_names: e });
                                                        }}
                                                    />
                                                    <Checkbox
                                                        className="checkbox"
                                                        id="search-intrinsics"
                                                        labelText="intrinsics"
                                                        disabled={false}
                                                        hideLabel={false}
                                                        wrapperClassName=""
                                                        onChange={e => {
                                                            this.setState({ search_intrinsics: e });
                                                        }}
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <Accordion>
                                    {this.genData(this.state.data)}
                                    {this.genIntrinsics(this.state.intrinsics)}
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
