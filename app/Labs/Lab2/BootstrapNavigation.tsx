import Link from "next/link";
import { Button, Card, CardBody, CardImg, CardText, CardTitle, Nav, NavItem, NavLink } from "react-bootstrap";

export default function BootstrapNavigation() {
    return (
        <div id="wd-css-BootstrapNavigation">
        <div id="wd-css-navigating-with-tabs">
        <h2>Tabs</h2>
        <Nav variant="tabs">
            <NavItem>
            <NavLink href="#/Labs/Lab2/Active">Active</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="#/Labs/Lab2/Link1">Link 1</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="#/Labs/Lab2/Link2">Link 2</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="#/Labs/Lab2/Disabled" disabled>Disabled</NavLink>
            </NavItem>
        </Nav>
        </div>
        <div id="wd-css-navigating-with-tabs">
        <h2>Tabs</h2>
        <Nav variant="tabs">
            <NavItem>
            <NavLink href="../Labs">Labs</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="/Labs/Lab1">Lab 1</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="#/Labs/Lab2">Lab 2</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="#/Labs/Lab3">Lab 2</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="/" as={Link}>Kambaz</NavLink>
            </NavItem>
            <NavItem>
            <NavLink href="https://github.com/V-O-I-D-E-D">My GitHub</NavLink>
            </NavItem>
        </Nav>
        </div>
        <div id="wd-css-navigating-with-cards">
        <h2> Cards </h2>
        <Card style={{ width: "18rem" }}>
            <CardImg variant="top" src="/images/cat-with-sunglasses-on-head.jpg" />
            <CardBody>
            <CardTitle>Stacking Starship</CardTitle>
            <CardText>
                Stacking the most powerful rocket in history. Mars or bust!
            </CardText>
            <Button variant="primary">Boldly Go</Button>
            </CardBody>
        </Card>
        </div>

        </div>
 );
}