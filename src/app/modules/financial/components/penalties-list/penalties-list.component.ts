import { Component, type OnInit } from "@angular/core"

@Component({
  selector: "app-penalties-list",
  templateUrl: "./penalties-list.component.html",
  styleUrls: ["./penalties-list.component.scss"],
})
export class PenaltiesListComponent implements OnInit {
  penalties: any[] = []
  loading = false

  ngOnInit(): void {
    // Placeholder for penalties functionality
    this.penalties = []
  }
}
