use rusqlite::Connection;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct Message {
    pub text: String,
    pub sender: String,
    pub date: String,
    pub is_from_me: bool,
}

#[derive(Serialize, Deserialize)]
pub struct Conversation {
    pub chat_id: String,
    pub display_name: String,
    pub messages: Vec<Message>,
}

#[tauri::command]
fn read_imessage_database(limit: Option<i64>) -> Result<Vec<Conversation>, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let db_path = home_dir.join("Library/Messages/chat.db");
    
    if !db_path.exists() {
        return Err("Messages database not found. Make sure Full Disk Access is granted to Super Tools.".to_string());
    }
    
    let conn = Connection::open_with_flags(
        &db_path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_URI,
    ).map_err(|e| format!("Failed to open database: {}", e))?;
    
    let limit = limit.unwrap_or(1000);
    
    let query = format!(
        r#"
        SELECT 
            m.text,
            m.date/1000000000 + 978307200 as date_utc,
            m.is_from_me,
            h.id as sender,
            c.chat_identifier,
            c.display_name
        FROM message m
        JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
        JOIN chat c ON cmj.chat_id = c.ROWID
        LEFT JOIN handle h ON m.handle_id = h.ROWID
        WHERE m.text IS NOT NULL AND length(m.text) > 0
        ORDER BY m.date DESC
        LIMIT {}
        "#,
        limit
    );
    
    let mut stmt = conn.prepare(&query).map_err(|e| format!("Query error: {}", e))?;
    
    let messages = stmt.query_map([], |row| {
        let text: Option<String> = row.get(0)?;
        let date_utc: i64 = row.get(1)?;
        let is_from_me: bool = row.get(2)?;
        let sender: Option<String> = row.get(3)?;
        let chat_id: String = row.get(4)?;
        let display_name: Option<String> = row.get(5)?;
        
        let date = chrono::DateTime::from_timestamp(date_utc, 0)
            .map(|dt| dt.format("%Y-%m-%d %H:%M").to_string())
            .unwrap_or_else(|| date_utc.to_string());
        
        let display_name_or_chat_id = display_name.unwrap_or_else(|| chat_id.clone());
        
        Ok((Message {
            text: text.unwrap_or_default(),
            sender: sender.unwrap_or_else(|| if is_from_me { "Me".to_string() } else { "Unknown".to_string() }),
            date,
            is_from_me,
        }, chat_id, display_name_or_chat_id))
    }).map_err(|e| format!("Query execution error: {}", e))?;
    
    use std::collections::HashMap;
    let mut conversations: HashMap<String, Conversation> = HashMap::new();
    
    for result in messages {
        let (msg, chat_id, display_name) = result.map_err(|e| format!("Row error: {}", e))?;
        
        conversations.entry(chat_id.clone())
            .or_insert_with(|| Conversation {
                chat_id: chat_id.clone(),
                display_name,
                messages: Vec::new(),
            })
            .messages.push(msg);
    }
    
    let mut result: Vec<Conversation> = conversations.into_values().collect();
    for conv in &mut result {
        conv.messages.reverse();
    }
    
    result.sort_by(|a, b| {
        let a_date = a.messages.last().map(|m| &m.date).unwrap_or(&String::new()).clone();
        let b_date = b.messages.last().map(|m| &m.date).unwrap_or(&String::new()).clone();
        b_date.cmp(&a_date)
    });
    
    Ok(result)
}

#[tauri::command]
fn check_full_disk_access() -> Result<bool, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let db_path = home_dir.join("Library/Messages/chat.db");
    
    if !db_path.exists() {
        return Ok(false);
    }
    
    match Connection::open_with_flags(
        &db_path,
        rusqlite::OpenFlags::SQLITE_OPEN_READ_ONLY | rusqlite::OpenFlags::SQLITE_OPEN_URI,
    ) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![read_imessage_database, check_full_disk_access])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
