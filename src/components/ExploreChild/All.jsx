// import React from 'react'
// import Template from '../Template'
import Comics from './Comics'
import Action from './Action'
import Detective from './Detective'
import Scifi from './Scifi'
import Motivational from './Motivational'
import Romantic from './Romantic'
const All = () => {
    return (
        <>
            <section className="">
                <Comics/>
                <Romantic/>
                <Action/>
                <Detective/>
                <Scifi/>
                <Motivational/>

            </section>
        </>
    )
}

export default All
