import { resolvePlugin } from '@babel/core';
import pool from './pool';

async function transact (q) {
  const client = await pool.connect()
  let res
  try {
    await client.query('BEGIN')
    try {
      res = await client.query(q)
      await client.query('COMMIT')
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    }
  } finally {
    client.release()
  }
  return res
}


async function runTransaction(q) {    
  // little helper so if you add on a semicolon at the end of your query
  // string like a sane person, it won't fart out on you
  q = q.endsWith(";") ? q.slice(0, -1) : q;

  console.log("\n"+ q + "\n");
  
  try {
      const { rows } = await transact(q)
      // console.log(JSON.stringify(rows))
  } catch (err) {
      console.error('Database ' + err + " in query:")
      console.log(q)
    }  
}


const runQuery = query => {
  pool.query(query)
  .then((res) => {
    console.log("res", res);
    pool.end();
  })
  .catch((err) => {
    console.log(err);
    pool.end();
  });
}


// CREATE MEMBERS-RELATED TABLES 
// TABLE NAMES: members, contact_info, member_sponsors
async function createMemberTables() {
  console.log("creating member tables...");

  const privilegeEnumCreate = `
    DROP TYPE IF EXISTS privilege;
    CREATE TYPE privilege AS ENUM ( 'board', 'reg_member', 'new_member', 'child', 'guest');`;
  const entityEnumCreate = `
    DROP TYPE IF EXISTS entity;
    CREATE TYPE entity AS ENUM ('business', 'individual')
  `;
  await runTransaction(privilegeEnumCreate);
  await runTransaction(entityEnumCreate);

  const membersTableCreateQuery = `  
    CREATE TABLE IF NOT EXISTS members (  
      id SERIAL PRIMARY KEY,
      contactID int,
      membership int,
      fname varchar(100),
      lname varchar(100),
      created_at date NOT NULL DEFAULT current_date,
      member_since date DEFAULT current_date,
      entity_type entity,
      access_privilege privilege,
      emergency_name varchar(100),
      emergency_phone varchar(15),
      emergency_rel varchar(100),
      balance decimal(12,4),
      active boolean
    )`;

    const contactsTableCreateQuery = `  
      CREATE TABLE IF NOT EXISTS contact_info (
        id SERIAL PRIMARY KEY,
        forum_name varchar(100),
        about_myself varchar(100),
        age_of_majority boolean,
        phone varchar(15),
        address varchar(100),
        city varchar(100),
        country varchar(100),
        postal varchar(10),
        email varchar(100) UNIQUE,
        student_conf date,
        student boolean,
        school_program varchar(200),
        grad_date date,
        auto_make_model varchar(100),
        auto_plate varchar(100),
        liability date,
        antibullying date,
        liab_link varchar(100),
        antibully_link varchar(100),
        total_donated decimal(12,4),
        stripe_info varchar(100)
      )
    `;

    const sponsorsTableCreateQuery = `  
      CREATE TABLE IF NOT EXISTS member_sponsors (
      id SERIAL PRIMARY KEY,
      memberID int NOT NULL,
      sponsorID int NOT NULL,
      consumables boolean NOT NULL DEFAULT false,
      storage boolean NOT NULL DEFAULT false,
      classes boolean NOT NULL DEFAULT false,
      membership boolean NOT NULL DEFAULT true
    )
    `;

  await runTransaction(membersTableCreateQuery);
  await runTransaction(contactsTableCreateQuery);
  await runTransaction(sponsorsTableCreateQuery);
  
  const createMembersReferencesQuery = `
    ALTER TABLE IF EXISTS contact_info ADD FOREIGN KEY (id) REFERENCES members(id);
    ALTER TABLE IF EXISTS member_sponsors ADD FOREIGN KEY (memberID) REFERENCES members(id);
    ALTER TABLE IF EXISTS member_sponsors ADD FOREIGN KEY (sponsorID) REFERENCES members(id)
  `;

  await runTransaction(createMembersReferencesQuery);

  console.log("member tables created!");
};


// CREATE STORAGE-RELATED TABLES
// TABLE NAMES: storage_types, storage_items, waitlists
async function  createStorageTables() {
  console.log("creating storage tables...");

  const storageTypeCreateQuery = `CREATE TABLE IF NOT EXISTS storage_types (         
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,   
      location VARCHAR(100),       
      cost decimal(12,4) NOT NULL
    )`;

    const storageItemsCreateQuery = `CREATE TABLE IF NOT EXISTS storage_items (
      id SERIAL PRIMARY KEY,
      storageID int NOT NULL,  
      name varchar(100) NOT NULL, 
      available boolean
    )`;

    const waitlistsCreateQuery = `CREATE TABLE IF NOT EXISTS waitlists (
      id SERIAL PRIMARY KEY,
      memberID int NOT NULL,              
      storageID int NOT NULL,                           
      active boolean NOT NULL DEFAULT true,              
      start_date date NOT NULL DEFAULT current_date
    )`;
  
    await runTransaction(storageTypeCreateQuery);
    await runTransaction(storageItemsCreateQuery);
    await runTransaction(waitlistsCreateQuery);

    const createStorageReferencesQuery = `
      ALTER TABLE IF EXISTS storage_items ADD FOREIGN KEY (storageID) REFERENCES storage_types(id);
      ALTER TABLE IF EXISTS waitlists ADD FOREIGN KEY (storageID) REFERENCES storage_types(id);
      ALTER TABLE IF EXISTS waitlists ADD FOREIGN KEY (memberID) REFERENCES members(id)
  `;

    await runTransaction(createStorageReferencesQuery);
 };


// CREATE BILLING-RELATED TABLES
// TABLE NAMES: invoice_items, subscriptions, invoices, 
//              payments, invoice_payments, membership_types
async function createBillingTables(){
  const createEnumsQuery = `
    DROP TYPE IF EXISTS charge_type;
    DROP TYPE IF EXISTS subscription_type;
    DROP TYPE IF EXISTS payment_method;
    CREATE TYPE charge_type AS ENUM ('vending','event');
    CREATE TYPE subscription_type AS ENUM ('membership','storage');
    CREATE TYPE payment_method AS ENUM ('credit', 'debit', 'cash', 'gift');
  `;
  await runTransaction(createEnumsQuery);

  const createLineItemsQuery = `
    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      memberID int NOT NULL,
      type charge_type,
      amount decimal(12,4) NOT NULL,
      gst_taxable boolean,
      pst_taxable boolean,
      details text,
      bill_to_ID int,            
      subscriptionID int,
      qty int,
      invoiceID int
    )`;

  const createSubscriptionsQuery = `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id SERIAL PRIMARY KEY,
      type subscription_type,
      start_date date,
      end_date date,
      cost decimal(12,4),
      cost_override decimal(12,4),
      bill_interval interval,
      memberID int,
      membership_typeID int,
      storage_itemID int,
      active boolean
  )`;
    
  const createMemberTypesQuery = `
    CREATE TABLE IF NOT EXISTS membership_types (
      id SERIAL PRIMARY KEY,
      name varchar(100) NOT NULL,
      amount_per_month decimal(12,4)
    )`;
    
  const createInvoicesQuery = `
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      date_created date,
      date_paid date,
      total decimal(12,4),
      memberID int
    )`;
    
  const createPaymentsQuery = `
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      payment_date date,
      amount decimal(12,4),
      method payment_method,
      payorID int
    )`;
    
  const createInvoicePaymentsQuery = `
    CREATE TABLE IF NOT EXISTS invoice_payments (
      id SERIAL PRIMARY KEY,
      invoiceID int,
      paymentID int,
      amount_applied decimal(12,4)
    )`;

    
    await runTransaction(createLineItemsQuery);
    await runTransaction(createSubscriptionsQuery);
    await runTransaction(createMemberTypesQuery);
    await runTransaction(createInvoicesQuery);
    await runTransaction(createPaymentsQuery);
    await runTransaction(createInvoicePaymentsQuery);


    const createBillingReferencesQuery= `
        ALTER TABLE invoices ADD FOREIGN KEY (memberID) REFERENCES members (id);

        ALTER TABLE invoice_items ADD FOREIGN KEY (invoiceID) REFERENCES invoices (id);
        ALTER TABLE invoice_items ADD FOREIGN KEY (memberID) REFERENCES members (id);
        ALTER TABLE invoice_items ADD FOREIGN KEY (bill_to_ID) REFERENCES members (id);
        ALTER TABLE invoice_items ADD FOREIGN KEY (subscriptionID) REFERENCES subscriptions (id);


        ALTER TABLE subscriptions ADD FOREIGN KEY (memberID) REFERENCES members (id);
        ALTER TABLE subscriptions ADD FOREIGN KEY (storage_itemID) REFERENCES storage_items (id);
        ALTER TABLE subscriptions ADD FOREIGN KEY (membership_typeID) REFERENCES membership_types (id);

        ALTER TABLE payments ADD FOREIGN KEY (payorID) REFERENCES members (id);

        ALTER TABLE invoice_payments ADD FOREIGN KEY (invoiceID) REFERENCES invoices (id);
        ALTER TABLE invoice_payments ADD FOREIGN KEY (paymentID) REFERENCES payments (id);
      `;
  
    await runTransaction(createBillingReferencesQuery);

};




/**
 * DROPS MEMBERS RELATED TABLES
 */
async function dropMemberTables() {
  const membersDropQuery = `
    DROP TABLE IF EXISTS members CASCADE;
    DROP TABLE IF EXISTS contact_info CASCADE;
    DROP TABLE IF EXISTS member_sponsors CASCADE
  `;
  await runTransaction(membersDropQuery);
};


/**
 * DROPS STORAGE RELATED TABLES
 */
async function dropStorageTables() {
  const storageDropQuery = `
    DROP TABLE IF EXISTS storage_types CASCADE;
    DROP TABLE IF EXISTS storage_items CASCADE;
    DROP TABLE IF EXISTS waitlists CASCADE
  `;
  await runTransaction(storageDropQuery);

};

/**
 * DROPS BILLING RELATED TABLES
 */
async function dropBillingTables() {

  const billingDropQuery = `
    DROP TABLE IF EXISTS invoice_items CASCADE;
    DROP TABLE IF EXISTS subscriptions CASCADE;
    DROP TABLE IF EXISTS invoices CASCADE;
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS invoice_payments CASCADE;
    DROP TABLE IF EXISTS membership_types CASCADE
  `;

  await runTransaction(billingDropQuery);
};




/**
 * Create All Tables
 */
async function createAllTables() {
  // pool.query('SELECT NOW()', (err, res) => {
  //   console.log(err, res)
  //   pool.end()
  // })
  await createMemberTables();
  await createStorageTables();
  await createBillingTables();
};


/**
 * Drop All Tables
 */
async function dropAllTables() {
  console.log("dropping all tables");
  await dropMemberTables();
  await dropStorageTables();
  await dropBillingTables();
};


pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});


export {
  createAllTables,
  dropAllTables,
};

require('make-runnable');