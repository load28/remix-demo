import {
  Form,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {json, LinksFunction, LoaderFunctionArgs, redirect} from '@remix-run/node'
import appStylesHref from './app.css?url'
import {createEmptyContact, getContacts} from "./data";
import {useEffect, useState} from "react";

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: appStylesHref}]
}


export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export const loader = async ({request}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const fq = url.searchParams.toString();
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({contacts, q, fq})
}

export default function App() {
  const navigation = useNavigation();
  const submit = useSubmit();
  const {contacts, q, fq} = useLoaderData<typeof loader>();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );

  // the query now needs to be kept in state
  const [query, setQuery] = useState(q || "");

  // we still have a `useEffect` to synchronize the query
  // to the component state on back/forward button clicks
  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <Meta/>
      <Links/>
    </head>
    <body>
    <div id="sidebar">
      <h1>Remix Contacts</h1>
      <div>
        <Form id="search-form" role="search"
              onChange={(event) =>
                submit(event.currentTarget)
              }>
          <input
            aria-label="Search contacts"
            id="q"
            name="q"
            // synchronize user's input to component state
            onChange={(event) =>
              setQuery(event.currentTarget.value)
            }
            placeholder="Search"
            type="search"
            // switched to `value` from `defaultValue`
            value={query}
          />
          <div id="search-spinner" aria-hidden hidden={!searching}/>
        </Form>
        <Form method="post">
          <button type="submit">New</button>
        </Form>
      </div>
      <nav>
        {contacts.length ? (
          <ul>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <NavLink
                  className={({isActive, isPending}) =>
                    isActive
                      ? "active"
                      : isPending
                        ? "pending"
                        : ""
                  }
                  to={`contacts/${contact.id}?${fq}`}
                >
                  {contact.first || contact.last ? (
                    <>
                      {contact.first} {contact.last}
                    </>
                  ) : (
                    <i>No Name</i>
                  )}{" "}
                  {contact.favorite ? (
                    <span>★</span>
                  ) : null}
                </NavLink>

              </li>
            ))}
          </ul>
        ) : (
          <p>
            <i>No contacts</i>
          </p>
        )}
      </nav>
    </div>
    <div className={
      navigation.state === "loading" && !searching
        ? "loading"
        : ""
    }
         id="detail"><Outlet/></div>
    <ScrollRestoration/>
    <Scripts/>
    </body>
    </html>
  );
}
